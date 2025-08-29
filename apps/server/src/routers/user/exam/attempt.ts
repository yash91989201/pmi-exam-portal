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
	CreateExamAttemptInput,
	CreateExamAttemptOutput,
	GetExamAttemptStatusInput,
	GetExamAttemptStatusOutput,
	GetExamForAttemptInput,
	GetExamForAttemptOutput,
	SubmitExamInput,
	SubmitExamOutput,
	TerminateExamInput,
} from "@/lib/schema";

export const userExamAttemptRouter = {
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

			await context.db
				.update(userExam)
				.set({
					attempts: existingUserExam.attempts + 1,
				})
				.where(eq(userExam.id, input.userExamId));

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
					startedAt: new Date(),
				})
				.where(
					and(
						eq(examAttempt.id, input.examAttemptId),
						eq(examAttempt.status, "started"),
					),
				);

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
			const { examId, examAttemptId, answers, timeSpent } = input;
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
					await tx
						.update(examAttempt)
						.set({
							completedAt: new Date(),
							status: "completed",
							marks: totalScore,
							timeSpent,
						})
						.where(eq(examAttempt.id, examAttemptId));

					if (responses.length > 0) {
						await tx.insert(attemptResponse).values(responses);
					}
				});
			} catch (error) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message:
						error instanceof Error ? error.message : "Failed to submit exam",
				});
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
			const { examId, examAttemptId, reason } = input;
			const { db, session } = context;

			const userExamRecord = await db.query.userExam.findFirst({
				where: and(
					eq(userExam.userId, session.user.id),
					eq(userExam.examId, examId),
				),
			});

			if (!userExamRecord) {
				throw new ORPCError("NOT_FOUND", { message: "User's exam not found" });
			}

			try {
				await db.transaction(async (tx) => {
					await tx
						.update(examAttempt)
						.set({
							completedAt: new Date(),
							status: "terminated",
							terminationReason: reason,
						})
						.where(eq(examAttempt.id, examAttemptId));
				});
			} catch (error) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message:
						error instanceof Error ? error.message : "Failed to terminate exam",
				});
			}

			return {
				success: true,
				message: "Exam terminated successfully.",
			};
		}),
};

export type UserExamAttemptRouterType = typeof userExamAttemptRouter;
