import { z } from "zod";

export const GetUserExamStatsInput = z.object({
	userId: z.string(),
});

export const UserExamStatsSchema = z.object({
	totalAssignedExams: z.number(),
	totalCompletedExams: z.number(),
	totalInProgressExams: z.number(),
	totalTerminatedExams: z.number(),
	averageScore: z.number(),
	highestScore: z.number(),
});

export type GetUserExamStatsInput = z.infer<typeof GetUserExamStatsInput>;
export type UserExamStats = z.infer<typeof UserExamStatsSchema>;
