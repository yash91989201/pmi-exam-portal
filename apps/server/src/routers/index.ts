import type { AdminRouterType } from "./admin";
import { adminRouter } from "./admin";
import type { ExamRouterType } from "./exam";
import { examRouter } from "./exam";
import type { HealthCheckRouterType } from "./health-check";
import { healthCheckRouter } from "./health-check";
import { type UserRouterType, userRouter } from "./user";

export type AppRouter = {
	healthCheck: HealthCheckRouterType;
	exam: ExamRouterType;
	admin: AdminRouterType;
	user: UserRouterType;
};

export const appRouter: AppRouter = {
	healthCheck: healthCheckRouter,
	exam: examRouter,
	admin: adminRouter,
	user: userRouter,
};
