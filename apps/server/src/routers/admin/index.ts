import type { AdminExamRouter } from "./exam";
import { adminExamRouter } from "./exam";
import type { AdminSettingRouter } from "./setting";
import { adminSettingRouter } from "./setting";
import type { AdminUserRouter } from "./user";
import { adminUserRouter } from "./user";

export type AdminRouterType = AdminExamRouter &
	AdminUserRouter &
	AdminSettingRouter;

export const adminRouter: AdminRouterType = {
	...adminExamRouter,
	...adminUserRouter,
	...adminSettingRouter,
};
