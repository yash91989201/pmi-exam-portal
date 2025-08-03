import { publicProcedure } from "@/lib/orpc";
import { adminSettingRouter } from "./admin-setting";
import { examRouter } from "./exam";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	adminSetting: adminSettingRouter,
	exam: examRouter,
};

export type AppRouter = typeof appRouter;
