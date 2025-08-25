import type { UserExamAttemptRouterType } from "./attempt";
import { userExamAttemptRouter } from "./attempt";
import type { UserExamStatsRouterType } from "./stats";
import { userExamStatsRouter } from "./stats";

export type UserExamRouterType = UserExamAttemptRouterType &
	UserExamStatsRouterType;

export const userExamRouter: UserExamRouterType = {
	...userExamAttemptRouter,
	...userExamStatsRouter,
};
