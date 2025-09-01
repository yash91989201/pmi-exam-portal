import { and, count, desc, eq, isNotNull, sql } from "drizzle-orm";
import z from "zod";
import { exam, examAttempt, orders, question, userExam } from "@/db/schema";
import { user } from "@/db/schema/auth";
import { adminProcedure } from "@/lib/orpc";

const DashboardStatsOutput = z.object({
	totalUsers: z.number(),
	totalExams: z.number(),
	totalAttempts: z.number(),
	totalQuestions: z.number(),
	totalOrders: z.number(),
	completedAttempts: z.number(),
	averageScore: z.number().nullable(),
});

const RecentActivityOutput = z.object({
	recentAttempts: z.array(
		z.object({
			id: z.string(),
			userName: z.string().nullable(),
			examCertification: z.string(),
			status: z.string(),
			marks: z.number().nullable(),
			completedAt: z.date().nullable(),
			terminationReason: z.string().nullable(),
		}),
	),
	recentUsers: z.array(
		z.object({
			id: z.string(),
			name: z.string().nullable(),
			email: z.string(),
			createdAt: z.date(),
		}),
	),
});

const ExamStatsOutput = z.object({
	examStats: z.array(
		z.object({
			certification: z.string(),
			totalQuestions: z.number(),
			totalAttempts: z.number(),
			averageScore: z.number().nullable(),
			passRate: z.number(),
		}),
	),
});

const UserActivityOutput = z.object({
	dailyRegistrations: z.array(
		z.object({
			date: z.string(),
			count: z.number(),
		}),
	),
	monthlyAttempts: z.array(
		z.object({
			month: z.string(),
			count: z.number(),
		}),
	),
});

export const adminDashboardRouter = {
	getDashboardStats: adminProcedure
		.output(DashboardStatsOutput)
		.handler(async ({ context }) => {
			try {
				const [
					totalUsersResult,
					totalExamsResult,
					totalAttemptsResult,
					totalQuestionsResult,
					totalOrdersResult,
					completedAttemptsResult,
					averageScoreResult,
				] = await Promise.all([
					// Total users count
					context.db
						.select({ count: count() })
						.from(user)
						.where(eq(user.role, "user")),
					// Total exams count
					context.db
						.select({ count: count() })
						.from(exam),
					// Total attempts count
					context.db
						.select({ count: count() })
						.from(examAttempt),
					// Total questions count
					context.db
						.select({ count: count() })
						.from(question),
					// Total orders count
					context.db
						.select({ count: count() })
						.from(orders),
					// Completed attempts count
					context.db
						.select({ count: count() })
						.from(examAttempt)
						.where(eq(examAttempt.status, "completed")),
					// Average score calculation - only for completed attempts with valid marks
					context.db
						.select({
							avgScore: sql<number | null>`AVG(marks)`,
						})
						.from(examAttempt)
						.where(
							and(
								eq(examAttempt.status, "completed"),
								isNotNull(examAttempt.marks),
							),
						),
				]);

				return {
					totalUsers: Number(totalUsersResult[0]?.count) || 0,
					totalExams: Number(totalExamsResult[0]?.count) || 0,
					totalAttempts: Number(totalAttemptsResult[0]?.count) || 0,
					totalQuestions: Number(totalQuestionsResult[0]?.count) || 0,
					totalOrders: Number(totalOrdersResult[0]?.count) || 0,
					completedAttempts: Number(completedAttemptsResult[0]?.count) || 0,
					averageScore: averageScoreResult[0]?.avgScore
						? Number(averageScoreResult[0].avgScore)
						: null,
				};
			} catch (_error: unknown) {
				return {
					totalUsers: 0,
					totalExams: 0,
					totalAttempts: 0,
					totalQuestions: 0,
					totalOrders: 0,
					completedAttempts: 0,
					averageScore: null,
				};
			}
		}),

	getRecentActivity: adminProcedure
		.output(RecentActivityOutput)
		.handler(async ({ context }) => {
			const [recentAttempts, recentUsers] = await Promise.all([
				context.db
					.select({
						id: examAttempt.id,
						userName: user.name,
						examCertification: exam.certification,
						status: examAttempt.status,
						marks: examAttempt.marks,
						completedAt: examAttempt.completedAt,
						terminationReason: examAttempt.terminationReason,
					})
					.from(examAttempt)
					.innerJoin(userExam, eq(examAttempt.userExamId, userExam.id))
					.innerJoin(user, eq(userExam.userId, user.id))
					.innerJoin(exam, eq(userExam.examId, exam.id))
					.orderBy(desc(examAttempt.startedAt))
					.limit(10),

				// Recent users
				context.db
					.select({
						id: user.id,
						name: user.name,
						email: user.email,
						createdAt: user.createdAt,
					})
					.from(user)
					.where(eq(user.role, "user"))
					.orderBy(desc(user.createdAt))
					.limit(10),
			]);

			return {
				recentAttempts,
				recentUsers,
			};
		}),

	getExamStats: adminProcedure
		.output(ExamStatsOutput)
		.handler(async ({ context }) => {
			try {
				// Get all exam stats in a single optimized query
				const examStatsResult = await context.db
					.select({
						certification: exam.certification,
						examId: exam.id,
						examMark: exam.mark,
						totalQuestions: sql<number>`(
						SELECT COUNT(*)
						FROM question q
						WHERE q.exam_id = exam.id
					)`,
						totalAttempts: sql<number>`(
						SELECT COUNT(*)
						FROM exam_attempt ea
						INNER JOIN user_exam ue ON ea.user_exam_id = ue.id
						WHERE ue.exam_id = exam.id
						AND ea.status = 'completed'
					)`,
						avgScore: sql<number | null>`(
						SELECT AVG(ea.marks)
						FROM exam_attempt ea
						INNER JOIN user_exam ue ON ea.user_exam_id = ue.id
						WHERE ue.exam_id = exam.id
						AND ea.status = 'completed'
						AND ea.marks IS NOT NULL
					)`,
						passedAttempts: sql<number>`(
						SELECT COUNT(*)
						FROM exam_attempt ea
						INNER JOIN user_exam ue ON ea.user_exam_id = ue.id
						WHERE ue.exam_id = exam.id
						AND ea.status = 'completed'
						AND ea.marks >= (exam.mark * 0.7)
					)`,
					})
					.from(exam);

				// Transform the results
				const examStats = examStatsResult.map((row) => {
					const totalAttempts = Number(row.totalAttempts) || 0;
					const passedAttempts = Number(row.passedAttempts) || 0;
					const avgScore = row.avgScore ? Number(row.avgScore) : null;

					return {
						certification: row.certification,
						totalQuestions: Number(row.totalQuestions) || 0,
						totalAttempts,
						averageScore: avgScore,
						passRate:
							totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
					};
				});

				return { examStats };
			} catch (_error: unknown) {
				return { examStats: [] };
			}
		}),

	getUserActivity: adminProcedure
		.output(UserActivityOutput)
		.handler(async ({ context }) => {
			const [dailyRegistrations, monthlyAttempts] = await Promise.all([
				context.db
					.select({
						date: sql<string>`TO_CHAR(${user.createdAt}, 'YYYY-MM-DD')`,
						count: count(),
					})
					.from(user)
					.where(sql`${user.createdAt} >= CURRENT_DATE - INTERVAL '30 days'`)
					.groupBy(sql`TO_CHAR(${user.createdAt}, 'YYYY-MM-DD')`)
					.orderBy(sql`TO_CHAR(${user.createdAt}, 'YYYY-MM-DD')`),

				// Monthly attempts for the last 12 months
				context.db
					.select({
						month: sql<string>`TO_CHAR(${examAttempt.startedAt}, 'YYYY-MM')`,
						count: count(),
					})
					.from(examAttempt)
					.where(sql`${examAttempt.startedAt} >= NOW() - INTERVAL '12 months'`)
					.groupBy(sql`TO_CHAR(${examAttempt.startedAt}, 'YYYY-MM')`)
					.orderBy(sql`TO_CHAR(${examAttempt.startedAt}, 'YYYY-MM')`),
			]);

			return {
				dailyRegistrations,
				monthlyAttempts,
			};
		}),
};

export type AdminDashboardRouter = typeof adminDashboardRouter;
