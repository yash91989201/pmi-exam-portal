import { type AdminUserBaseRouter, adminUserBaseRouter } from "./base";
import { type AdminUserExamRouter, adminUserExamRouter } from "./exam";
import { type AdminUserOrderRouter, adminUserOrderRouter } from "./order";

export type AdminUserRouter = AdminUserBaseRouter &
	AdminUserExamRouter &
	AdminUserOrderRouter;

export const adminUserRouter: AdminUserRouter = {
	...adminUserBaseRouter,
	...adminUserExamRouter,
	...adminUserOrderRouter,
};

