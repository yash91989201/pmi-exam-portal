import { and, avg, count, eq, isNotNull, max } from "drizzle-orm";
import { examAttempt, userExam } from "@/db/schema";
import { adminProcedure } from "@/lib/orpc";
import { GetUserExamStatsInput, UserExamStatsSchema } from "@/lib/schema/user";

export const adminUserStatsRouter = {
	getUserExamStats: adminProcedure
		.input(GetUserExamStatsInput)
		.output(UserExamStatsSchema)
		.handler(async ({ input, context }) => {
			const { userId } = input;

			// Execute all queries in parallel using Promise.all
			const [
				totalAssignedResult,
				completedResult,
				inProgressResult,
				terminatedResult,
				scoresResult,
			] = await Promise.all([
				// Get total assigned exams count
				context.db
					.select({ count: count() })
					.from(userExam)
					.where(eq(userExam.userId, userId))
					.then((result) => result[0]),

				// Get completed exams count
				context.db
					.select({ count: count() })
					.from(userExam)
					.innerJoin(examAttempt, eq(userExam.id, examAttempt.userExamId))
					.where(
						and(
							eq(userExam.userId, userId),
							eq(examAttempt.status, "completed"),
						),
					)
					.then((result) => result[0]),

				// Get in-progress exams count
				context.db
					.select({ count: count() })
					.from(userExam)
					.innerJoin(examAttempt, eq(userExam.id, examAttempt.userExamId))
					.where(
						and(
							eq(userExam.userId, userId),
							eq(examAttempt.status, "in_progress"),
						),
					)
					.then((result) => result[0]),

				// Get terminated exams count
				context.db
					.select({ count: count() })
					.from(userExam)
					.innerJoin(examAttempt, eq(userExam.id, examAttempt.userExamId))
					.where(
						and(
							eq(userExam.userId, userId),
							eq(examAttempt.status, "terminated"),
						),
					)
					.then((result) => result[0]),

				// Get average and highest scores from completed attempts with marks
				context.db
					.select({
						averageScore: avg(examAttempt.marks),
						highestScore: max(examAttempt.marks),
					})
					.from(userExam)
					.innerJoin(examAttempt, eq(userExam.id, examAttempt.userExamId))
					.where(
						and(
							eq(userExam.userId, userId),
							eq(examAttempt.status, "completed"),
							isNotNull(examAttempt.marks),
						),
					)
					.then((result) => result[0]),
			]);

			const totalAssignedExams = totalAssignedResult.count;
			const totalCompletedExams = completedResult.count;
			const totalInProgressExams = inProgressResult.count;
			const totalTerminatedExams = terminatedResult.count;
			const averageScore = scoresResult.averageScore || 0;
			const highestScore = scoresResult.highestScore || 0;

			return {
				totalAssignedExams,
				totalCompletedExams,
				totalInProgressExams,
				totalTerminatedExams,
				averageScore: Number(averageScore),
				highestScore: Number(highestScore),
			};
		}),
};

export type AdminUserStatsRouter = typeof adminUserStatsRouter;
