import { ORPCError } from "@orpc/server";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import {
	attemptResponse,
	exam,
	examAttempt,
	question,
	userExam,
} from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import {
	GetExamForAttemptInput,
	GetExamForAttemptOutput,
	ListUserExamsOutput,
	SubmitExamInput,
	SubmitExamOutput,
	TerminateExamInput,
} from "@/lib/schema";

export const userRouter = {
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

	getExamForAttempt: protectedProcedure
		.input(GetExamForAttemptInput)
		.output(GetExamForAttemptOutput)
		.handler(async ({ context, input }) => {
			const userExamRecord = await context.db.query.userExam.findFirst({
				where: and(
					eq(userExam.userId, context.session.user.id),
					eq(userExam.examId, input.examId),
				),
			});

			if (!userExamRecord) {
				throw new ORPCError("NOT_FOUND");
			}

			if (userExamRecord.attempts >= userExamRecord.maxAttempts) {
				throw new ORPCError("PRECONDITION_FAILED");
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

			return examRecord;
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
};

export type UserRouterType = typeof userRouter;
