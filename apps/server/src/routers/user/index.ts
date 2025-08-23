import { type UserExamRouterType, userExamRouter } from "./exam";
import { type UserOrderRouterType, userOrderRouter } from "./order";

export type UserRouterType = UserExamRouterType & UserOrderRouterType;

export const userRouter: UserRouterType = {
	...userExamRouter,
	...userOrderRouter,
};
