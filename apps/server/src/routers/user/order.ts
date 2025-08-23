import { asc, eq } from "drizzle-orm";
import { userOrders } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import { ListUserOrdersOutput } from "@/lib/schema";

export const userOrderRouter = {
	listOrders: protectedProcedure
		.output(ListUserOrdersOutput)
		.handler(async ({ context }) => {
			const existingUserOrders = await context.db.query.userOrders.findMany({
				where: eq(userOrders.userId, context.session.user.id),
				orderBy: [asc(userOrders.orderPriority)],
			});

			return {
				userOrders: existingUserOrders,
			};
		}),
};

export type UserOrderRouterType = typeof userOrderRouter;
