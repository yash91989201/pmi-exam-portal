/**
 * Copy exam content (exam -> question -> option) from one Postgres database into another.
 *
 * Usage:
 *   bun run db:import-exams -- --from <SOURCE_DATABASE_URL> --to <TARGET_DATABASE_URL>
 *   bun run scripts/migrate-exams.ts --from <SOURCE_DATABASE_URL> --to <TARGET_DATABASE_URL>
 *
 * URLs may also come from FROM_DATABASE_URL / TO_DATABASE_URL, or be typed interactively.
 * Add `?sslmode=require` to the URL for TLS connections (handled by node-postgres).
 *
 * Flags:
 *   --dry-run               Read + report only, write nothing.
 *   --truncate              Empty option/question/exam on the TARGET before loading (needs --yes).
 *   --on-conflict <mode>    skip (default) | overwrite
 *                             skip      = keep existing target rows (onConflictDoNothing)
 *                             overwrite = update existing target rows with source values
 *   --certification <name>  Only exams whose certification matches (case-insensitive); repeatable.
 *   --exam-id <id>          Only these exam ids; repeatable.
 *   --batch-size <n>        Rows per INSERT (default 500).
 *   --yes                   Skip confirmations (required with --truncate).
 *
 * Rows are copied with their original ids so question.exam_id / option.question_id stay valid.
 * The whole load runs in one target transaction: any failure rolls back.
 */

import { createInterface } from "node:readline/promises";
import { inArray, sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import { exam, option, question } from "../src/db/schema";

type ExamRow = typeof exam.$inferSelect;
type QuestionRow = typeof question.$inferSelect;
type OptionRow = typeof option.$inferSelect;
type DB = NodePgDatabase;

const REQUIRED_COLUMNS = {
	exam: ["id", "certification", "mark", "time_limit"],
	question: ["id", "text", "mark", "order", "image_id", "exam_id"],
	option: ["id", "text", "is_correct", "order", "question_id"],
} as const;

/** pg reports dual-stack connection failures as an AggregateError with an empty message. */
function errorMessage(err: unknown): string {
	if (err instanceof AggregateError) {
		const inner = Array.from(err.errors as Iterable<unknown>)
			.map(errorMessage)
			.join("; ");
		return inner.length > 0 ? inner : "connection failed";
	}
	return err instanceof Error ? err.message : String(err);
}

type TableName = keyof typeof REQUIRED_COLUMNS;

function fail(message: string): never {
	console.error(`\nerror: ${message}`);
	process.exit(1);
}

function chunk<T>(items: readonly T[], size: number): T[][] {
	const batches: T[][] = [];
	for (let i = 0; i < items.length; i += size)
		batches.push(items.slice(i, i + size));
	return batches;
}

function parseArgs(argv: string[]) {
	const flags: Record<string, string[]> = {};
	const positional: string[] = [];

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (!arg.startsWith("--")) {
			positional.push(arg);
			continue;
		}
		const [name, inlineValue] = arg.slice(2).split("=", 2);
		const key = name.toLowerCase();
		flags[key] ??= [];
		if (inlineValue !== undefined) {
			flags[key].push(inlineValue);
			continue;
		}
		const next = argv[i + 1];
		if (next !== undefined && !next.startsWith("--")) {
			flags[key].push(next);
			i++;
		} else {
			flags[key].push("true");
		}
	}

	const single = (key: string) => flags[key]?.[0];
	const onConflict = (single("on-conflict") ?? "skip").toLowerCase();
	if (onConflict !== "skip" && onConflict !== "overwrite") {
		fail(`--on-conflict must be "skip" or "overwrite" (got "${onConflict}")`);
	}
	const batchSize = Number(single("batch-size") ?? 500);
	if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 5000) {
		fail("--batch-size must be an integer between 1 and 5000");
	}

	return {
		from: single("from") ?? positional[0] ?? process.env.FROM_DATABASE_URL,
		to: single("to") ?? positional[1] ?? process.env.TO_DATABASE_URL,
		dryRun: flags["dry-run"] !== undefined,
		truncate: flags.truncate !== undefined,
		onConflict: onConflict as "skip" | "overwrite",
		certifications: (flags.certification ?? []).filter(Boolean),
		examIds: (flags["exam-id"] ?? []).filter(Boolean),
		batchSize,
		schema: single("schema") ?? "public",
		yes: flags.yes !== undefined,
	};
}

/** Inject `search_path` into a connection URL without dropping params already present. */
function withSearchPath(url: string, schema: string): string {
	if (schema === "public") return url;
	const parsed = new URL(url);
	const existing = parsed.searchParams.get("options");
	parsed.searchParams.set(
		"options",
		existing
			? `${existing} -c search_path=${schema}`
			: `-c search_path=${schema}`,
	);
	return parsed.toString();
}

function connect(url: string, schema: string, label: string) {
	const pool = new pg.Pool({
		connectionString: withSearchPath(url, schema),
		max: 4,
		connectionTimeoutMillis: 15_000,
	});
	pool.on("error", (err) =>
		console.error(`[${label}] idle client error:`, err.message),
	);
	return { pool, db: drizzle(pool) as DB };
}

async function assertColumns(
	db: DB,
	label: string,
	schema: string,
): Promise<void> {
	for (const table of Object.keys(REQUIRED_COLUMNS) as TableName[]) {
		const result = await db.execute<{ column_name: string }>(sql`
			select column_name
			from information_schema.columns
			where table_name = ${table} and table_schema = ${schema}
		`);
		const present = new Set(result.rows.map((row) => row.column_name));
		if (present.size === 0) {
			fail(
				`table "${table}" not found in ${label} database (schema "${schema}")`,
			);
		}
		const missing = REQUIRED_COLUMNS[table].filter(
			(column) => !present.has(column),
		);
		if (missing.length > 0) {
			fail(
				`${label} database table "${table}" is missing columns: ${missing.join(", ")}. ` +
					`Bring it up to date with "DATABASE_URL=<${label} url> bun run db:push" (from apps/server), then retry.`,
			);
		}
	}
}

/** Count target rows belonging to the migrated set (id for exam, parent id for children). */
async function countBy(
	db: DB,
	table: TableName,
	ids: readonly string[],
): Promise<number> {
	if (ids.length === 0) return 0;
	let total = 0;
	for (const batch of chunk(ids, 1000)) {
		let rows: Array<{ n: number }>;
		if (table === "exam") {
			rows = await db
				.select({ n: sql<number>`count(*)::int` })
				.from(exam)
				.where(inArray(exam.id, batch));
		} else if (table === "question") {
			rows = await db
				.select({ n: sql<number>`count(*)::int` })
				.from(question)
				.where(inArray(question.examId, batch));
		} else {
			rows = await db
				.select({ n: sql<number>`count(*)::int` })
				.from(option)
				.where(inArray(option.questionId, batch));
		}
		total += rows[0]?.n ?? 0;
	}
	return total;
}

/**
 * Source rows whose parent row is gone. These are unreachable through the normal
 * read path (children are loaded by parent id), so they are reported, not copied.
 */
async function countDangling(
	db: DB,
	schema: string,
	table: "question" | "option",
): Promise<number> {
	const child = sql`${sql.identifier(schema)}.${sql.identifier(table)}`;
	const parent = sql`${sql.identifier(schema)}.${sql.identifier(table === "question" ? "exam" : "question")}`;
	const joinOn =
		table === "question" ? sql`p.id = c.exam_id` : sql`p.id = c.question_id`;
	const result = await db.execute<{ n: number }>(sql`
		select count(*)::int as n
		from ${child} c
		where not exists (select 1 from ${parent} p where ${joinOn})
	`);
	return result.rows[0]?.n ?? 0;
}

async function main() {
	const args = parseArgs(process.argv.slice(2));

	let from = args.from;
	let to = args.to;
	if ((!from || !to) && process.stdin.isTTY) {
		const rl = createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		if (!from)
			from = (await rl.question("SOURCE database URL (from): ")).trim();
		if (!to) to = (await rl.question("TARGET database URL (to): ")).trim();
		rl.close();
	}
	if (!from)
		fail("missing source URL - pass --from <url> or set FROM_DATABASE_URL");
	if (!to) fail("missing target URL - pass --to <url> or set TO_DATABASE_URL");
	if (from === to) fail("source and target URLs are identical - nothing to do");
	if (args.truncate && !args.yes) {
		fail("--truncate wipes target exam data: re-run with --yes to confirm");
	}

	const redact = (url: string) => url.replace(/\/\/[^@]*@/, "//***@");
	console.log("\nexam data migration");
	console.log(`  from      ${redact(from)}`);
	console.log(`  to        ${redact(to)}`);
	console.log(`  schema    ${args.schema}`);
	console.log(
		`  mode      ${
			args.dryRun
				? "dry-run"
				: `${args.onConflict === "skip" ? "insert missing" : "insert + overwrite"}${
						args.truncate ? " (target cleared first)" : ""
					}`
		}`,
	);
	if (args.certifications.length > 0) {
		console.log(
			`  exams     certification in [${args.certifications.join(", ")}]`,
		);
	}
	if (args.examIds.length > 0)
		console.log(`  exams     id in [${args.examIds.join(", ")}]`);
	console.log("");

	const source = connect(from, args.schema, "source");
	const target = connect(to, args.schema, "target");
	const closeAll = async () => {
		await source.pool.end();
		await target.pool.end();
	};
	try {
		await source.pool.query("select 1");
		await target.pool.query("select 1");
	} catch (err) {
		fail(`could not connect to both databases: ${errorMessage(err)}`);
	}

	await assertColumns(source.db, "source", args.schema);
	await assertColumns(target.db, "target", args.schema);

	// ---------- read source ----------
	const allExams: ExamRow[] = await source.db
		.select()
		.from(exam)
		.orderBy(exam.certification, exam.id);
	const selected = allExams.filter((row) => {
		if (args.examIds.length > 0 && !args.examIds.includes(row.id)) return false;
		if (args.certifications.length > 0) {
			return args.certifications.some(
				(c) => c.toLowerCase() === row.certification.toLowerCase(),
			);
		}
		return true;
	});
	if (selected.length === 0) {
		console.log("no exams matched - nothing to migrate");
		await closeAll();
		return;
	}
	const examIds = selected.map((row) => row.id);
	console.log(`read ${selected.length} exam(s) from source`);

	const questions: QuestionRow[] = [];
	for (const batch of chunk(examIds, 200)) {
		questions.push(
			...(await source.db
				.select()
				.from(question)
				.where(inArray(question.examId, batch))
				.orderBy(question.examId, question.order, question.id)),
		);
	}

	const questionIds = questions.map((row) => row.id);

	const options: OptionRow[] = [];
	for (const batch of chunk(questionIds, 200)) {
		options.push(
			...(await source.db
				.select()
				.from(option)
				.where(inArray(option.questionId, batch))
				.orderBy(option.questionId, option.order, option.id)),
		);
	}

	const danglingQuestions = await countDangling(
		source.db,
		args.schema,
		"question",
	);
	const danglingOptions = await countDangling(source.db, args.schema, "option");
	if (danglingQuestions > 0) {
		console.log(
			`  note: source has ${danglingQuestions} question(s) whose exam row no longer exists - not copied`,
		);
	}
	if (danglingOptions > 0) {
		console.log(
			`  note: source has ${danglingOptions} option(s) whose question row no longer exists - not copied`,
		);
	}

	console.log(
		`read ${questions.length} question(s) and ${options.length} option(s) from source`,
	);

	const examValues = selected.map((row) => ({
		id: row.id,
		certification: row.certification,
		mark: row.mark,
		timeLimit: row.timeLimit,
	}));
	const questionValues = questions.map((row) => ({
		id: row.id,
		text: row.text,
		mark: row.mark,
		order: row.order,
		imageId: row.imageId,
		examId: row.examId,
	}));
	const optionValues = options.map((row) => ({
		id: row.id,
		text: row.text,
		isCorrect: row.isCorrect,
		order: row.order,
		questionId: row.questionId,
	}));

	if (args.dryRun) {
		console.log("\ndry run - no changes written. Would copy:");
		console.log(`  exam      ${examValues.length}`);
		console.log(`  question  ${questionValues.length}`);
		console.log(`  option    ${optionValues.length}`);
		for (const row of examValues.slice(0, 10)) {
			const count = questionValues.filter(
				(item) => item.examId === row.id,
			).length;
			console.log(
				`    - ${row.certification} (${row.mark} marks, ${row.timeLimit} min, ${count} questions)`,
			);
		}
		if (examValues.length > 10)
			console.log(`    ... ${examValues.length - 10} more`);
		await closeAll();
		return;
	}

	const written = { exam: 0, question: 0, option: 0 };
	const started = Date.now();

	await target.db.transaction(async (tx) => {
		if (args.truncate) {
			// DELETE, not TRUNCATE: Postgres refuses TRUNCATE on tables other tables reference
			// (attempt_response -> option), even when those referencing tables are empty.
			try {
				await tx.execute(sql`delete from "option"`);
				await tx.execute(sql`delete from "question"`);
				await tx.execute(sql`delete from "exam"`);
				console.log("\ncleared existing target exam data");
			} catch (err) {
				throw new Error(
					`could not clear target exam data (${errorMessage(err)}). Rows in user_exam, exam_attempt ` +
						"or attempt_response still point at the target exams - migrate or remove those rows first.",
				);
			}
		}

		for (const batch of chunk(examValues, args.batchSize)) {
			const result =
				args.onConflict === "overwrite"
					? await tx
							.insert(exam)
							.values(batch)
							.onConflictDoUpdate({
								target: exam.id,
								set: {
									certification: sql`excluded."certification"`,
									mark: sql`excluded."mark"`,
									timeLimit: sql`excluded."time_limit"`,
								},
							})
					: await tx.insert(exam).values(batch).onConflictDoNothing();
			written.exam += result.rowCount ?? 0;
		}

		for (const batch of chunk(questionValues, args.batchSize)) {
			const result =
				args.onConflict === "overwrite"
					? await tx
							.insert(question)
							.values(batch)
							.onConflictDoUpdate({
								target: question.id,
								set: {
									text: sql`excluded."text"`,
									mark: sql`excluded."mark"`,
									order: sql`excluded."order"`,
									imageId: sql`excluded."image_id"`,
									examId: sql`excluded."exam_id"`,
								},
							})
					: await tx.insert(question).values(batch).onConflictDoNothing();
			written.question += result.rowCount ?? 0;
		}

		for (const batch of chunk(optionValues, args.batchSize)) {
			const result =
				args.onConflict === "overwrite"
					? await tx
							.insert(option)
							.values(batch)
							.onConflictDoUpdate({
								target: option.id,
								set: {
									text: sql`excluded."text"`,
									isCorrect: sql`excluded."is_correct"`,
									order: sql`excluded."order"`,
									questionId: sql`excluded."question_id"`,
								},
							})
					: await tx.insert(option).values(batch).onConflictDoNothing();
			written.option += result.rowCount ?? 0;
		}
	});

	console.log(`\nwrote in ${((Date.now() - started) / 1000).toFixed(1)}s`);
	console.log(`  exam      ${written.exam} row(s)`);
	console.log(`  question  ${written.question} row(s)`);
	console.log(`  option    ${written.option} row(s)`);
	if (args.onConflict === "skip") {
		const skipped = {
			exam: examValues.length - written.exam,
			question: questionValues.length - written.question,
			option: optionValues.length - written.option,
		};
		if (skipped.exam + skipped.question + skipped.option > 0) {
			console.log(
				`  already present (skipped): exam ${skipped.exam}, question ${skipped.question}, option ${skipped.option}`,
			);
		}
	}

	// ---------- verify ----------
	const checks: Array<[TableName, number, readonly string[]]> = [
		["exam", examValues.length, examIds],
		["question", questionValues.length, examIds],
		["option", optionValues.length, questionIds],
	];
	let verified = true;
	console.log("\nverification (target row counts for migrated ids)");
	for (const [table, expected, ids] of checks) {
		const actual = await countBy(target.db, table, ids);
		if (actual !== expected) verified = false;
		console.log(
			`  ${table.padEnd(9)} ${String(actual).padStart(6)} / ${expected}  ${actual === expected ? "ok" : "MISMATCH"}`,
		);
	}

	await closeAll();

	if (!verified) {
		fail(
			"target counts do not match the source - investigate before using this data",
		);
	}
	console.log("\ndone");
}

main().catch((err) => {
	console.error("\nmigration failed:", errorMessage(err));
	process.exit(1);
});
