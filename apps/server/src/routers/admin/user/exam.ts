import { ORPCError } from "@orpc/server";
import { and, asc, eq, ilike, sql } from "drizzle-orm";
import { exam, userExam } from "@/db/schema";
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
			const { userId, query } = input;
			const examQuery = query?.exam;

			const examsAssignedStatus = await context.db
				.select({
					examId: exam.id,
					examCertification: exam.certification,
					assigned: userExam.userId,
				})
				.from(exam)
				.leftJoin(
					userExam,
					and(eq(userExam.userId, userId), eq(userExam.examId, exam.id)),
				)
				.where(examQuery ? ilike(exam.certification, `%${examQuery}%`) : undefined)
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
				console.error("Error managing user exams:", error);

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
		.handler(async ({ context, input }) => {
			const userExamsData = await context.db.query.userExam.findMany({
				where: eq(userExam.userId, input.userId),
				with: {
					exam: true,
				},
			});

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
				console.error("Error increasing exam attempts:", error);

				return {
					success: false,
					message:
						error instanceof Error
							? error.message
							: "Failed to increase exam attempts",
				};
			}
		}),
};

export type AdminUserExamRouter = typeof adminUserExamRouter;