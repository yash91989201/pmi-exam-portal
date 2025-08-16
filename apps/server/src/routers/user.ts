import { ORPCError } from "@orpc/server";
import type { UserWithRole } from "better-auth/plugins";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { adminProcedure } from "@/lib/orpc";

export const userRouter = {
	listUsers: adminProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(100).default(10),
			}),
		)
		.output(
			z.object({
				users: z.array(z.custom<UserWithRole>()),
				total: z.number(),
				page: z.number(),
				totalPages: z.number(),
				hasNextPage: z.boolean(),
				hasPreviousPage: z.boolean(),
			}),
		)
		.handler(async ({ input }) => {
			try {
				const { page, limit } = input;
				const offset = (page - 1) * limit;

				const { users = [], total = 0 } = await auth.api.listUsers({
					query: {
						limit: limit.toString(),
						offset: offset.toString(),
						filterField: "role",
						filterOperator: "ne",
						filterValue: "admin",
					},
				});

				const totalPages = Math.ceil(total / limit);

				return {
					users: users.map((user) => ({
						...user,
						image: user.image ?? null,
					})),
					total,
					page,
					totalPages,
					hasNextPage: page < totalPages,
					hasPreviousPage: page > 1,
				};
			} catch (error) {
				console.error("Error listing users:", error);
				throw new ORPCError(
					error instanceof Error ? error.message : "Failed to list users",
					{ status: 500 },
				);
			}
		}),

	deleteUser: adminProcedure
		.input(
			z.object({
				userId: z.string(),
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				message: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			try {
				await auth.api.removeUser({
					body: {
						userId: input.userId,
					},
				});

				return {
					success: true,
					message: "User deleted successfully",
				};
			} catch (error) {
				console.error("Error deleting user:", error);
				throw new ORPCError(
					error instanceof Error ? error.message : "Failed to delete user",
					{ status: 500 },
				);
			}
		}),

	banUser: adminProcedure
		.input(
			z.object({
				userId: z.string(),
				reason: z.string().optional(),
				expiresIn: z.number().optional(), // milliseconds
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				message: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			try {
				await auth.api.banUser({
					body: {
						userId: input.userId,
						banReason: input.reason,
						banExpiresIn: input.expiresIn,
					},
				});

				return {
					success: true,
					message: "User banned successfully",
				};
			} catch (error) {
				console.error("Error banning user:", error);
				throw new ORPCError(
					error instanceof Error ? error.message : "Failed to ban user",
					{ status: 500 },
				);
			}
		}),

	unbanUser: adminProcedure
		.input(
			z.object({
				userId: z.string(),
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				message: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			try {
				await auth.api.unbanUser({
					body: {
						userId: input.userId,
					},
				});

				return {
					success: true,
					message: "User unbanned successfully",
				};
			} catch (error) {
				console.error("Error unbanning user:", error);
				throw new ORPCError(
					error instanceof Error ? error.message : "Failed to unban user",
					{ status: 500 },
				);
			}
		}),
};
