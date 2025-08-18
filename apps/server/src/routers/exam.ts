import { ORPCError } from "@orpc/server";
import { and, asc, count, eq, type SQL } from "drizzle-orm";
import z from "zod";
import { exam, examAttempt, option, question, userExam } from "@/db/schema";
import { adminProcedure } from "@/lib/orpc";
import {
	BulkUploadExcelOutput,
	CreateExamInput,
	CreateExamOutput,
	GetExamsAssignedStatusInput,
	GetExamsAssignedStatusOutput,
	ListExamsInput,
	ListExamsOutput,
} from "@/lib/schema";
import { importExcelData } from "@/utils/excel-import";

export const examRouter = {
	createExam: adminProcedure
		.input(CreateExamInput)
		.output(CreateExamOutput)
		.handler(async ({ context, input }) => {
			try {
				// Use a database transaction to ensure data consistency
				const result = await context.db.transaction(async (tx) => {
					// Create the exam first
					const [newExam] = await tx
						.insert(exam)
						.values({
							certification: input.certification,
							mark: input.mark,
							timeLimit: input.timeLimit,
						})
						.returning();

					// Create questions and options
					for (const questionData of input.questions) {
						const [newQuestion] = await tx
							.insert(question)
							.values({
								text: questionData.text,
								mark: questionData.mark,
								order: questionData.order,
								imageId: questionData.imageId,
								examId: newExam.id,
							})
							.returning();

						// Create options for this question
						if (questionData.options && questionData.options.length > 0) {
							const optionValues = questionData.options.map((optionData) => ({
								text: optionData.text,
								isCorrect: optionData.isCorrect,
								order: optionData.order,
								questionId: newQuestion.id,
							}));

							await tx.insert(option).values(optionValues);
						}
					}

					return newExam;
				});

				return {
					success: true,
					message: "Exam created successfully with questions and options",
					data: result,
				};
			} catch (error) {
				console.error("Error creating exam:", error);
				throw new ORPCError(
					error instanceof Error ? error.message : "Failed to create exam",
					{ status: 500 },
				);
			}
		}),

	bulkUploadExcel: adminProcedure
		.input(
			z.object({
				file: z.instanceof(File),
			}),
		)
		.output(BulkUploadExcelOutput)
		.handler(async ({ input }) => {
			try {
				const buffer = await input.file.arrayBuffer();
				const result = await importExcelData(buffer, input.file.name);

				if (result.success) {
					return {
						success: true,
						message: `Successfully processed ${result.data?.length || 0} questions from Excel file`,
						data: result.data,
					};
				}

				return {
					success: false,
					message: result.error || "Failed to process Excel file",
					validationErrors: result.validationErrors,
				};
			} catch (error) {
				throw new ORPCError(
					error instanceof Error
						? error.message
						: "Failed to process Excel file",
					{ status: 400 },
				);
			}
		}),

	listExams: adminProcedure
		.input(ListExamsInput)
		.output(ListExamsOutput)
		.handler(async ({ context, input }) => {
			const { page, limit, filter } = input;

			// Build dynamic query conditions
			const whereConditions: SQL[] = [];
			let needsJoin = false;

			// Apply attemptCount filter if provided
			if (filter?.attemptCount !== undefined) {
				whereConditions.push(
					eq(examAttempt.attemptNumber, filter.attemptCount),
				);

				needsJoin = true;
			}

			let examsBaseQuery = context.db.select().from(exam).$dynamic();

			let examsCountBaseQuery = context.db
				.select({ count: count(exam.id) })
				.from(exam)
				.$dynamic();

			if (needsJoin) {
				examsBaseQuery.innerJoin(
					examAttempt,
					eq(exam.id, examAttempt.userExamId),
				);

				examsCountBaseQuery.innerJoin(
					examAttempt,
					eq(exam.id, examAttempt.userExamId),
				);
			}

			// Apply where conditions if any
			if (whereConditions.length > 0) {
				const combinedWhere =
					whereConditions.length === 1
						? whereConditions[0]
						: and(...whereConditions);

				examsBaseQuery = examsBaseQuery.where(combinedWhere);
				examsCountBaseQuery = examsCountBaseQuery.where(combinedWhere);
			}

			// Execute queries
			const [examsResult, totalCountResult] = await Promise.all([
				examsBaseQuery
					.limit(limit)
					.offset((page - 1) * limit)
					.orderBy(asc(exam.id))
					.execute(),
				examsCountBaseQuery.execute().then((r) => Number(r[0]?.count || 0)),
			]);

			const totalPages = Math.ceil(totalCountResult / limit);

			return {
				exams: examsResult,
				page,
				totalPages,
				totalCount: totalCountResult,
				hasPreviousPage: page > 1,
				hasNextPage: page < totalPages,
			};
		}),
	getExamsAssignedStatus: adminProcedure
		.input(GetExamsAssignedStatusInput)
		.output(GetExamsAssignedStatusOutput)
		.handler(async ({ context, input }) => {
			const examsAssignedStatus = await context.db
				.select({
					examId: exam.id,
					examCertification: exam.certification,
					assigned: userExam.userId,
				})
				.from(exam)
				.leftJoin(
					userExam,
					and(
						eq(userExam.userId, input.userId),
						eq(userExam.examId, exam.id),
						eq(userExam.attempts, 0),
					),
				)
				.orderBy(asc(exam.id));

			const transformedResult = examsAssignedStatus.map((item) => ({
				examId: item.examId,
				examCertification: item.examCertification,
				assigned: item.assigned !== null,
			}));

			return {
				examsAssignedStatus: transformedResult,
			};
		}),
};
