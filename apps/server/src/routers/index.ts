import { publicProcedure } from "@/lib/orpc";
import { adminSettingRouter } from "./admin-setting";
import { examRouter } from "./exam";
import { userRouter } from "./user";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	adminSetting: adminSettingRouter,
	exam: examRouter,
	user: userRouter,
};

export type AppRouter = typeof appRouter;
