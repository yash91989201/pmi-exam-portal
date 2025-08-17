import { ORPCError } from "@orpc/server";
import { auth } from "@/lib/auth";
import { adminProcedure } from "@/lib/orpc";
import { ListUsersInput, ListUsersOutput } from "@/lib/schema";

export const adminRouter = {
	listUsers: adminProcedure
		.input(ListUsersInput)
		.output(ListUsersOutput)
		.handler(async ({ input, context }) => {
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
					headers: context.headers,
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
};
