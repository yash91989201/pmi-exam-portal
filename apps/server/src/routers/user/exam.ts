import { ORPCError } from "@orpc/server";
import { createId } from "@paralleldrive/cuid2";
import { and, desc, eq, inArray } from "drizzle-orm";
import {
	attemptResponse,
	exam,
	examAttempt,
	question,
	userExam,
} from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import {
	CreateExamAttemptInput,
	CreateExamAttemptOutput,
	GetExamAttemptStatusInput,
	GetExamAttemptStatusOutput,
	GetExamForAttemptInput,
	GetExamForAttemptOutput,
	GetExamStatsOutput,
	ListUserExamsOutput,
	SubmitExamInput,
	SubmitExamOutput,
	TerminateExamInput,
} from "@/lib/schema";

export const userExamRouter = {
	listExams: protectedProcedure
		.output(ListUserExamsOutput)
		.handler(async ({ context }) => {
			const userExams = await context.db.query.userExam.findMany({
				where: eq(userExam.userId, context.session.user.id),
				with: {
					exam: true,
				},
			});

			return { userExams };
		}),

	createExamAttempt: protectedProcedure
		.input(CreateExamAttemptInput)
		.output(CreateExamAttemptOutput)
		.handler(async ({ context, input }) => {
			const existingUserExam = await context.db.query.userExam.findFirst({
				where: eq(userExam.id, input.userExamId),
			});

			if (!existingUserExam) {
				throw new ORPCError("User exam not found");
			}

			if (existingUserExam.attempts >= existingUserExam.maxAttempts) {
				throw new ORPCError("PRECONDITION_FAILED");
			}

			const newExamAttempt = await context.db
				.insert(examAttempt)
				.values({
					userExamId: input.userExamId,
					status: "started",
					attemptNumber: existingUserExam.attempts + 1,
				})
				.returning();

			await context.db.update(userExam).set({
				attempts: existingUserExam.attempts + 1,
			});

			return {
				success: true,
				message: "Exam attempt created successfully",
				data: {
					examAttemptId: newExamAttempt[0].id,
				},
			};
		}),

	getExamForAttempt: protectedProcedure
		.input(GetExamForAttemptInput)
		.output(GetExamForAttemptOutput)
		.handler(async ({ context, input }) => {
			const existingExamAttempt = await context.db.query.examAttempt.findFirst({
				where: eq(examAttempt.id, input.examAttemptId),
			});

			if (!existingExamAttempt) {
				throw new ORPCError("NOT_FOUND");
			}

			const examRecord = await context.db.query.exam.findFirst({
				where: eq(exam.id, input.examId),
				with: {
					questions: {
						with: {
							options: {
								columns: {
									isCorrect: false,
								},
							},
						},
					},
				},
			});

			if (!examRecord) {
				throw new ORPCError("NOT_FOUND");
			}

			await context.db
				.update(examAttempt)
				.set({
					status: "in_progress",
				})
				.where(eq(examAttempt.id, input.examAttemptId));

			const examDataForAttempt = {
				...examRecord,
				questions: examRecord.questions.map((question) => ({
					questionId: question.id,
					...question,
					options: question.options.map((option) => ({
						...option,
						optionId: undefined,
					})),
				})),
			};

			return examDataForAttempt;
		}),

	getExamAttemptStatus: protectedProcedure
		.input(GetExamAttemptStatusInput)
		.output(GetExamAttemptStatusOutput)
		.handler(async ({ context, input }) => {
			const examAttemptStatus = await context.db.query.examAttempt.findFirst({
				where: eq(examAttempt.id, input.examAttemptId),
				columns: {
					status: true,
				},
			});

			if (!examAttemptStatus) {
				throw new ORPCError("NOT_FOUND");
			}

			return {
				data: {
					status: examAttemptStatus.status,
				},
			};
		}),

	submitExam: protectedProcedure
		.input(SubmitExamInput)
		.output(SubmitExamOutput)
		.handler(async ({ context, input }) => {
			const { examId, answers } = input;
			const { db, session } = context;

			const userExamRecord = await db.query.userExam.findFirst({
				where: and(
					eq(userExam.userId, session.user.id),
					eq(userExam.examId, examId),
				),
			});

			if (!userExamRecord) {
				throw new ORPCError("NOT_FOUND");
			}
			if (userExamRecord.attempts >= userExamRecord.maxAttempts) {
				throw new ORPCError("PRECONDITION_FAILED");
			}

			const questions = await db.query.question.findMany({
				where: eq(question.examId, examId),
				with: {
					options: true,
				},
			});

			let totalScore = 0;
			const responses: (typeof attemptResponse.$inferInsert)[] = [];

			for (const answer of answers) {
				const q = questions.find((q) => q.id === answer.questionId);
				if (!q) continue;

				const correctOption = q.options.find((o) => o.isCorrect);
				const isCorrect =
					answer.optionId !== undefined &&
					answer.optionId === correctOption?.id;
				const score = isCorrect ? q.mark : 0;
				totalScore += score;

				responses.push({
					id: createId(),
					userExamId: userExamRecord.id,
					questionId: answer.questionId,
					optionId: answer.optionId,
					isCorrect,
					score,
				});
			}

			try {
				await db.transaction(async (tx) => {
					await tx.insert(examAttempt).values({
						id: createId(),
						userExamId: userExamRecord.id,
						startedAt: new Date(), // This should be tracked properly
						completedAt: new Date(),
						status: "completed",
						marks: totalScore,
						attemptNumber: userExamRecord.attempts + 1,
					});

					if (responses.length > 0) {
						await tx.insert(attemptResponse).values(responses);
					}

					await tx
						.update(userExam)
						.set({
							attempts: userExamRecord.attempts + 1,
						})
						.where(eq(userExam.id, userExamRecord.id));
				});
			} catch (error) {
				console.error("Failed to submit exam:", error);
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}

			return {
				success: true,
				message: "Exam submitted successfully!",
			};
		}),

	terminateExam: protectedProcedure
		.input(TerminateExamInput)
		.output(SubmitExamOutput)
		.handler(async ({ context, input }) => {
			const { examId, reason } = input;
			const { db, session } = context;

			const userExamRecord = await db.query.userExam.findFirst({
				where: and(
					eq(userExam.userId, session.user.id),
					eq(userExam.examId, examId),
				),
			});

			if (!userExamRecord) {
				throw new ORPCError("NOT_FOUND");
			}

			try {
				await db.transaction(async (tx) => {
					await tx.insert(examAttempt).values({
						id: createId(),
						userExamId: userExamRecord.id,
						startedAt: new Date(), // This should be tracked properly
						completedAt: new Date(),
						status: "terminated",
						marks: 0,
						attemptNumber: userExamRecord.attempts + 1,
						terminationReason: reason,
					});

					await tx
						.update(userExam)
						.set({
							attempts: userExamRecord.attempts + 1,
						})
						.where(eq(userExam.id, userExamRecord.id));
				});
			} catch (error) {
				console.error("Failed to terminate exam:", error);
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}

			return {
				success: true,
				message: "Exam terminated successfully.",
			};
		}),

	getExamStats: protectedProcedure
		.output(GetExamStatsOutput)
		.handler(async ({ context }) => {
			const { db, session } = context;

			// Get all user exams for this user
			const userExams = await db.query.userExam.findMany({
				where: eq(userExam.userId, session.user.id),
				with: {
					exam: {
						columns: {
							mark: true,
						},
					},
				},
			});

			if (userExams.length === 0) {
				return {
					totalExams: 0,
					totalPassed: 0,
					totalFailed: 0,
					averageScore: 0,
					highestScore: 0,
					mostRecentAttempt: null,
				};
			}

			// Get all exam attempts for these user exams
			const userExamIds = userExams.map((ue) => ue.id);
			const attempts = await db.query.examAttempt.findMany({
				where: and(
					inArray(examAttempt.userExamId, userExamIds),
					eq(examAttempt.status, "completed"),
				),
				orderBy: [desc(examAttempt.completedAt)],
			});

			if (attempts.length === 0) {
				return {
					totalExams: userExams.length,
					totalPassed: 0,
					totalFailed: 0,
					averageScore: 0,
					highestScore: 0,
					mostRecentAttempt: null,
				};
			}

			// Calculate statistics
			let totalPassed = 0;
			let totalFailed = 0;
			let totalScore = 0;
			let highestScore = 0;

			for (const attempt of attempts) {
				const userExamRecord = userExams.find(
					(ue) => ue.id === attempt.userExamId,
				);
				if (!userExamRecord) continue;

				const percentage =
					userExamRecord.exam.mark > 0
						? ((attempt.marks || 0) / userExamRecord.exam.mark) * 100
						: 0;

				// Assume 60% as passing threshold (this could be configurable per exam in the future)
				if (percentage >= 60) {
					totalPassed++;
				} else {
					totalFailed++;
				}

				totalScore += percentage;
				if (percentage > highestScore) {
					highestScore = percentage;
				}
			}

			const averageScore =
				attempts.length > 0 ? totalScore / attempts.length : 0;
			const mostRecentAttempt =
				attempts.length > 0 ? attempts[0].completedAt : null;

			return {
				totalExams: userExams.length,
				totalPassed,
				totalFailed,
				averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
				highestScore: Math.round(highestScore * 100) / 100, // Round to 2 decimal places
				mostRecentAttempt,
			};
		}),
};

export type UserExamRouterType = typeof userExamRouter;
