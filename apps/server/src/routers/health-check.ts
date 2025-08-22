import { publicProcedure } from "@/lib/orpc";

export const healthCheckRouter = publicProcedure.handler(() => {
	return "OK";
});

export type HealthCheckRouterType = typeof healthCheckRouter;
