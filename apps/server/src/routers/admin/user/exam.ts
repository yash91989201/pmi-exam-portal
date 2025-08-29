import { ORPCError } from "@orpc/server";
import { and, asc, eq, ilike, isNotNull, isNull, sql } from "drizzle-orm";
import { exam, examAttempt, userExam } from "@/db/schema";
import { user } from "@/db/schema/auth";
import { adminProcedure } from "@/lib/orpc";
import {
	GetExamsAssignedStatusInput,
	GetExamsAssignedStatusOutput,
	GetUserExamsDataInput,
	GetUserExamsDataOutput,
	IncreaseExamAttemptsInput,
	IncreaseExamAttemptsOutput,
	UpdateExamsAssignedStatusInput,
	UpdateExamsAssignedStatusOutput,
} from "@/lib/schema";

export const adminUserExamRouter = {
	getExamsAssignedStatus: adminProcedure
		.input(GetExamsAssignedStatusInput)
		.output(GetExamsAssignedStatusOutput)
		.handler(async ({ context, input }) => {
			try {
				const { userId, query, filter, cursor, limit } = input;
				const examQuery = query?.exam;
				const assignmentStatus = filter?.status ?? "all";

				// Build base where conditions
				const whereConditions = [];

				// Add exam search filter
				if (examQuery) {
					whereConditions.push(ilike(exam.certification, `%${examQuery}%`));
				}

				// Add assignment status filter
				if (assignmentStatus === "assigned") {
					whereConditions.push(isNotNull(userExam.userId));
				} else if (assignmentStatus === "unassigned") {
					whereConditions.push(isNull(userExam.userId));
				}

				// Add cursor condition if provided
				if (cursor) {
					whereConditions.push(sql`${exam.id} > ${cursor}`);
				}

				const whereClause =
					whereConditions.length > 0 ? and(...whereConditions) : undefined;

				// Get data with limit + 1 to determine if there are more results
				const queryBuilder = context.db
					.select({
						examId: exam.id,
						examCertification: exam.certification,
						assigned: sql<boolean>`${userExam.userId} IS NOT NULL`,
					})
					.from(exam)
					.leftJoin(
						userExam,
						and(eq(userExam.userId, userId), eq(userExam.examId, exam.id)),
					)
					.where(whereClause)
					.orderBy(asc(exam.id))
					.limit(limit + 1); // Get one extra to check if there are more results

				const results = await queryBuilder;

				// Determine if there are more results
				const hasMore = results.length > limit;
				const data = hasMore ? results.slice(0, limit) : results;

				// Generate next cursor
				let nextCursor: string | undefined;
				if (hasMore && data.length > 0) {
					const lastItem = data[data.length - 1];
					if (lastItem) {
						nextCursor = lastItem.examId;
					}
				}

				return { examsAssignedStatus: data, nextCursor };
			} catch (error) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message:
						error instanceof Error
							? error.message
							: "Failed to fetch exams assigned status",
				});
			}
		}),
	updateExamsAssignedStatus: adminProcedure
		.input(UpdateExamsAssignedStatusInput)
		.output(UpdateExamsAssignedStatusOutput)
		.handler(async ({ context, input }) => {
			try {
				const { userId, examsAssignedStatus: userExamsAssignedStatus } = input;

				// Verify user exists
				const existingUser = await context.db.query.user.findFirst({
					where: eq(user.id, userId),
				});

				if (!existingUser) {
					throw new ORPCError("User not found", { status: 404 });
				}

				const results = await context.db.transaction(async (tx) => {
					const processResults = [];

					for (const examAssignment of userExamsAssignedStatus) {
						const { examId, assigned } = examAssignment;

						const existingUserExam = await tx.query.userExam.findFirst({
							where: and(
								eq(userExam.userId, userId),
								eq(userExam.examId, examId),
							),
						});

						if (assigned) {
							if (!existingUserExam) {
								await tx.insert(userExam).values({
									userId,
									examId,
									assignedAt: new Date(),
									attempts: 0,
									maxAttempts: 1,
								});
							}
						} else {
							if (existingUserExam) {
								await tx
									.delete(userExam)
									.where(
										and(
											eq(userExam.userId, userId),
											eq(userExam.examId, examId),
										),
									);
							}
						}

						processResults.push({
							examId,
							assigned,
						});
					}

					return processResults;
				});

				return {
					success: true,
					message: "User exam assignments updated successfully",
					data: results,
				};
			} catch (error) {
				if (error instanceof ORPCError) {
					throw error;
				}

				throw new ORPCError(
					error instanceof Error
						? error.message
						: "Failed to manage user exams",
					{ status: 500 },
				);
			}
		}),
	getUserExamsData: adminProcedure
		.input(GetUserExamsDataInput)
		.output(GetUserExamsDataOutput)
		.handler(async ({ context: { db }, input: { userId } }) => {
			const userExamsData = await db
				.select({
					userExamId: userExam.id,
					certification: exam.certification,
					status: sql<string>`COALESCE(${examAttempt.status}, 'assigned')`,
					marks: sql<number>`COALESCE(${examAttempt.marks}, 0)`,
					attempt: sql<number>`COALESCE(${examAttempt.attemptNumber}, 0)`,
					timeSpent: sql<number>`COALESCE(${examAttempt.timeSpent}, 0)`,
					maxAttempts: userExam.maxAttempts,
					terminationReason: examAttempt.terminationReason,
				})
				.from(userExam)
				.innerJoin(exam, eq(userExam.examId, exam.id))
				.leftJoin(
					examAttempt,
					sql`${examAttempt.userExamId} = ${userExam.id} AND ${examAttempt.attemptNumber} = (
          SELECT MAX(${examAttempt.attemptNumber})
          FROM ${examAttempt}
          WHERE ${examAttempt.userExamId} = ${userExam.id}
        )`,
				)
				.where(eq(userExam.userId, userId));

			return { userExamsData };
		}),
	increaseUserExamAttempts: adminProcedure
		.input(IncreaseExamAttemptsInput)
		.output(IncreaseExamAttemptsOutput)
		.handler(async ({ context, input }) => {
			try {
				const updateQueryRes = await context.db
					.update(userExam)
					.set({
						maxAttempts: sql`${userExam.maxAttempts} + 1`,
					})
					.where(eq(userExam.id, input.userExamId))
					.returning();

				return {
					success: true,
					message: "Exam attempts increased successfully",
					data: {
						maxAttempts: updateQueryRes[0].maxAttempts,
						userExamId: updateQueryRes[0].id,
					},
				};
			} catch (error) {
				return {
					success: false,
					message:
						error instanceof Error
							? error.message
							: "Failed to increase user exams",
				};
			}
		}),
};

export type AdminUserExamRouter = typeof adminUserExamRouter;
