import { ORPCError } from "@orpc/server";
import { createId } from "@paralleldrive/cuid2";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { orders, userOrders } from "@/db/schema";
import { user } from "@/db/schema/auth";
import { adminProcedure } from "@/lib/orpc";
import {
	GetUserOrdersInput,
	GetUserOrdersOutput,
	ManageUserOrdersInput,
	ManageUserOrdersOutput,
} from "@/lib/schema";

export const adminUserOrderRouter = {
	getUserOrders: adminProcedure
		.input(GetUserOrdersInput)
		.output(GetUserOrdersOutput)
		.handler(async ({ context, input }) => {
			const userOrdersData = await context.db.query.userOrders.findMany({
				where: eq(userOrders.userId, input.userId),
				orderBy: [asc(userOrders.orderPriority)],
			});

			return { userOrders: userOrdersData };
		}),

	manageUserOrders: adminProcedure
		.input(ManageUserOrdersInput)
		.output(ManageUserOrdersOutput)
		.handler(async ({ context, input }) => {
			try {
				const { userId, orders } = input;

				// Verify user exists
				const existingUser = await context.db.query.user.findFirst({
					where: eq(user.id, userId),
				});

				if (!existingUser) {
					throw new ORPCError("User not found", { status: 404 });
				}

				await context.db.transaction(async (tx) => {
					// Delete all existing orders for the user
					await tx.delete(userOrders).where(eq(userOrders.userId, userId));

					if (orders.length > 0) {
						// Insert the new orders
						await tx.insert(userOrders).values(
							orders.map((order) => ({
								...order,
								userId,
								orderId: order.id,
							})),
						);
					}
				});

				return {
					success: true,
					message: "User orders updated successfully",
				};
			} catch (error) {
				if (error instanceof ORPCError) {
					throw error;
				}

				throw new ORPCError(
					error instanceof Error
						? error.message
						: "Failed to manage user orders",
					{ status: 500 },
				);
			}
		}),

	syncUserOrders: adminProcedure
		.input(z.object({ userId: z.string() }))
		.output(z.object({ success: z.boolean(), message: z.string() }))
		.handler(async ({ context, input }) => {
			try {
				const { userId } = input;

				const existingUser = await context.db.query.user.findFirst({
					where: eq(user.id, userId),
				});

				if (!existingUser) {
					throw new ORPCError("User not found", { status: 404 });
				}

				const allOrders = await context.db.query.orders.findMany();
				const userOrdersData = await context.db.query.userOrders.findMany({
					where: eq(userOrders.userId, userId),
				});

				const userOrderMap = new Set(userOrdersData.map((uo) => uo.orderId));
				const newUserOrdersToInsert: {
					userId: string;
					orderId: string;
					orderText: string;
					orderPriority: number;
					isCompleted: boolean;
				}[] = [];

				for (const order of allOrders) {
					if (!userOrderMap.has(order.id)) {
						newUserOrdersToInsert.push({
							userId: userId,
							orderId: order.id,
							orderText: order.orderText,
							orderPriority: order.orderPriority,
							isCompleted: false,
						});
					}
				}

				if (newUserOrdersToInsert.length > 0) {
					await context.db.insert(userOrders).values(newUserOrdersToInsert);
				}

				return {
					success: true,
					message: "User orders synced successfully.",
				};
			} catch (error) {
				if (error instanceof ORPCError) {
					throw error;
				}
				throw new ORPCError(
					error instanceof Error
						? error.message
						: "Failed to sync user orders",
					{ status: 500 },
				);
			}
		}),
};

export type AdminUserOrderRouter = typeof adminUserOrderRouter;

