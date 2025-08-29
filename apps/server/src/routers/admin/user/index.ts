import { type AdminUserBaseRouter, adminUserBaseRouter } from "./base";
import { type AdminUserExamRouter, adminUserExamRouter } from "./exam";
import { type AdminUserOrderRouter, adminUserOrderRouter } from "./order";
import { type AdminUserStatsRouter, adminUserStatsRouter } from "./stats";

export type AdminUserRouter = AdminUserBaseRouter &
	AdminUserExamRouter &
	AdminUserOrderRouter &
	AdminUserStatsRouter;

export const adminUserRouter: AdminUserRouter = {
	...adminUserBaseRouter,
	...adminUserExamRouter,
	...adminUserOrderRouter,
	...adminUserStatsRouter,
};

