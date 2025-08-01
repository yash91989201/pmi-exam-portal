import { publicProcedure } from "@/lib/orpc";
import { adminSetting } from "./admin-setting";
import { dummy } from "./dummy";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	adminSetting,
	dummy,
};

export type AppRouter = typeof appRouter;
