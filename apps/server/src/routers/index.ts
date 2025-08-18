import { publicProcedure } from "@/lib/orpc";
import { adminRouter } from "./admin";
import { adminSettingRouter } from "./admin-setting";
import { examRouter } from "./exam";

const healthCheck = publicProcedure.handler(() => {
	return "OK";
});

type AppRouterType = {
	healthCheck: typeof healthCheck;
	adminSetting: typeof adminSettingRouter;
	exam: typeof examRouter;
	admin: typeof adminRouter;
};

export const appRouter: AppRouterType = {
	healthCheck,
	adminSetting: adminSettingRouter,
	exam: examRouter,
	admin: adminRouter,
};

export type AppRouter = typeof appRouter;
