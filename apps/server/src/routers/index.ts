import { publicProcedure } from "@/lib/orpc";
import { adminSetting } from "./admin-setting";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	adminSetting,
};

export type AppRouter = typeof appRouter;
