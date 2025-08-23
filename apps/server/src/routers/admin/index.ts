import type { AdminDashboardRouter } from "./dashboard";
import { adminDashboardRouter } from "./dashboard";
import type { AdminExamRouter } from "./exam";
import { adminExamRouter } from "./exam";
import { type AdminOrderRouter, adminOrderRouter } from "./order";
import type { AdminSettingRouter } from "./setting";
import { adminSettingRouter } from "./setting";
import type { AdminUserRouter } from "./user";
import { adminUserRouter } from "./user/index";

export type AdminRouterType = AdminExamRouter &
	AdminUserRouter &
	AdminSettingRouter &
	AdminOrderRouter &
	AdminDashboardRouter;

export const adminRouter: AdminRouterType = {
	...adminExamRouter,
	...adminUserRouter,
	...adminSettingRouter,
	...adminOrderRouter,
	...adminDashboardRouter,
};
