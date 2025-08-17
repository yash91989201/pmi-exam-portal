import { publicProcedure } from "@/lib/orpc";
import { adminRouter } from "./admin";
import { adminSettingRouter } from "./admin-setting";
import { examRouter } from "./exam";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	adminSetting: adminSettingRouter,
	exam: examRouter,
	admin: adminRouter,
};

export type AppRouter = typeof appRouter;
