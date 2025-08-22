import { userExamRouter } from "./exam";

export type UserRouterType = typeof userExamRouter;

export const userRouter: UserRouterType = {
	...userExamRouter,
};
