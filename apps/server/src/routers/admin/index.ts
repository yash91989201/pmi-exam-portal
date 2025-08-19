import { adminExamRouter } from "./exam";
import { adminSettingRouter } from "./setting";
import { adminUserRouter } from "./user";

export type AdminRouterType = typeof adminExamRouter &
	typeof adminUserRouter &
	typeof adminSettingRouter;

export const adminRouter: AdminRouterType = {
	...adminExamRouter,
	...adminUserRouter,
	...adminSettingRouter,
};
