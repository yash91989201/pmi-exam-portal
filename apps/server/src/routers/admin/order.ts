import { createId } from "@paralleldrive/cuid2";
import { asc, eq } from "drizzle-orm";
import { orders, userOrders } from "@/db/schema";
import { user } from "@/db/schema/auth";
import { adminProcedure } from "@/lib/orpc";
import { UpdateOrdersInput, UpdateOrdersOutput } from "@/lib/schema";
import type { OrderType, UserOrderType } from "@/lib/types";

export const adminOrderRouter = {
	listOrders: adminProcedure.handler(({ context }) => {
		return context.db.query.orders.findMany({
			orderBy: [asc(orders.orderPriority)],
		});
	}),
	getOrdersIdWithText: adminProcedure.handler(({ context }) => {
		return context.db.query.orders.findMany({
			columns: {
				id: true,
				orderText: true,
			},
			orderBy: [asc(orders.orderPriority)],
		});
	}),
	updateOrders: adminProcedure
		.input(UpdateOrdersInput)
		.output(UpdateOrdersOutput)
		.handler(async ({ context, input }) => {
			const existingOrders = await context.db.query.orders.findMany();
			const existingUsers = await context.db.query.user.findMany({
				where: eq(user.role, "user"),
			});
			const { orders: updatedOrders } = input;

			const newOrders: OrderType[] = [];
			const updatedOrdersId: string[] = [];
			const deletedOrdersId: string[] = [];
			const newUsersOrders: UserOrderType[] = [];

			existingOrders.forEach((existingOrder) => {
				const currentUpdatedOrder = updatedOrders.find(
					(updatedOrder) => updatedOrder.id === existingOrder.id,
				);

				if (currentUpdatedOrder === undefined) {
					deletedOrdersId.push(existingOrder.id);
					return;
				}

				if (
					currentUpdatedOrder.orderPriority !== existingOrder.orderPriority ||
					currentUpdatedOrder.orderText !== existingOrder.orderText
				) {
					updatedOrdersId.push(existingOrder.id);
				}
			});

			updatedOrders.forEach((updatedOrder) => {
				const existingOrder = existingOrders.find(
					(existingOrder) => existingOrder.id === updatedOrder.id,
				);
				if (existingOrder === undefined) {
					newOrders.push(updatedOrder);
				}
			});

			if (newOrders.length > 0) {
				await context.db.insert(orders).values(newOrders);
			}

			if (existingUsers.length > 0 && newOrders.length > 0) {
				existingUsers.forEach((existingUser) => {
					const newUserOrder: UserOrderType[] = newOrders.map((newOrder) => ({
						...newOrder,
						orderId: newOrder.id,
						userId: existingUser.id,
						userOrderId: createId(),
						isCompleted: false,
					}));

					newUsersOrders.push(...newUserOrder);
				});
				await context.db.insert(userOrders).values(newUsersOrders);
			}

			if (updatedOrdersId.length > 0) {
				await Promise.all(
					updatedOrdersId.map(async (updatedOrderId) => {
						// biome-ignore lint/style/noNonNullAssertion: <explanation>
						const { orderPriority, orderText } = updatedOrders.find(
							(updatedOrder) => updatedOrder.id === updatedOrderId,
						)!;

						const updatedOrderQuery = await context.db
							.update(orders)
							.set({ orderText, orderPriority })
							.where(eq(orders.id, updatedOrderId))
							.returning();

						return updatedOrderQuery[0];
					}),
				);
				await Promise.all(
					updatedOrdersId.map(async (updatedOrderId) => {
						// biome-ignore lint/style/noNonNullAssertion: <explanation>
						const { orderPriority, orderText } = updatedOrders.find(
							(updatedOrder) => updatedOrder.id === updatedOrderId,
						)!;
						const updatedUsersOrderQuery = await context.db
							.update(userOrders)
							.set({ orderText, orderPriority })
							.where(eq(userOrders.orderId, updatedOrderId))
							.returning();

						return updatedUsersOrderQuery[0];
					}),
				);
			}

			if (deletedOrdersId.length > 0) {
				await Promise.all(
					deletedOrdersId.map(async (deletedOrderId) => {
						const deleteOrderQuery = await context.db
							.delete(orders)
							.where(eq(orders.id, deletedOrderId))
							.returning();

						return deleteOrderQuery[0];
					}),
				);
				await Promise.all(
					deletedOrdersId.map(async (deletedOrderId) => {
						const updatedUsersOrderQuery = await context.db
							.delete(userOrders)
							.where(eq(userOrders.orderId, deletedOrderId))
							.returning();

						return updatedUsersOrderQuery[0];
					}),
				);
			}

			return {
				success: true,
				message: "Orders updated successfully",
			};
		}),
};

export type AdminOrderRouter = typeof adminOrderRouter;
