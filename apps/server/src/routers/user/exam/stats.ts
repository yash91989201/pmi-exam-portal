import { and, desc, eq, inArray } from "drizzle-orm";
import { examAttempt, userExam } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import {
	GetExamStatsOutput,
	ListExamResultsOutput,
	ListUserExamsOutput,
} from "@/lib/schema";

export const userExamStatsRouter = {
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

	listExamResults: protectedProcedure
		.output(ListExamResultsOutput)
		.handler(async ({ context }) => {
			const { db, session } = context;

			const userExams = await db.query.userExam.findMany({
				where: eq(userExam.userId, session.user.id),
				columns: {
					id: true,
				},
			});

			if (userExams.length === 0) {
				return {
					results: [],
				};
			}

			const userExamIds = userExams.map((ue) => ue.id);

			const attempts = await db.query.examAttempt.findMany({
				where: and(
					inArray(examAttempt.userExamId, userExamIds),
					eq(examAttempt.status, "completed"),
				),
				with: {
					userExam: {
						with: {
							exam: true,
						},
					},
				},
				orderBy: [desc(examAttempt.completedAt)],
			});

			const results = attempts.map((attempt) => {
				const totalMarks = attempt.userExam.exam.mark;
				const marks = attempt.marks || 0;
				const percentage = totalMarks > 0 ? (marks / totalMarks) * 100 : 0;
				const status: "passed" | "failed" =
					percentage >= 60 ? "passed" : "failed";

				return {
					id: attempt.id,
					examName: attempt.userExam.exam.certification,
					completedAt: attempt.completedAt as Date,
					marks,
					totalMarks,
					status,
				};
			});

			return {
				results,
			};
		}),
};

export type UserExamStatsRouterType = typeof userExamStatsRouter;
