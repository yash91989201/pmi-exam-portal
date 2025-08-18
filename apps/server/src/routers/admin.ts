import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { userExam } from "@/db/schema";
import { user } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { adminProcedure } from "@/lib/orpc";
import {
	GetUserExamsDataInput,
	GetUserExamsDataOutput,
	GetUserInput,
	ListUsersInput,
	ListUsersOutput,
	UpdateExamsAssignedStatusInput,
	UpdateExamsAssignedStatusOutput,
	UserSchema,
} from "@/lib/schema";

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
	getUser: adminProcedure
		.input(GetUserInput)
		.output(UserSchema.optional())
		.handler(async ({ input, context }) => {
			const existingUser = await context.db.query.user.findFirst({
				where: eq(user.id, input.userId),
			});

			return existingUser;
		}),
	updateExamsAssignedStatus: adminProcedure
		.input(UpdateExamsAssignedStatusInput)
		.output(UpdateExamsAssignedStatusOutput)
		.handler(async ({ context, input }) => {
			try {
				const { userId, examsAssignedStatus: userExamsAssignedStatus } = input;

				// Verify user exists
				const existingUser = await context.db.query.user.findFirst({
					where: eq(user.id, userId),
				});

				if (!existingUser) {
					throw new ORPCError("User not found", { status: 404 });
				}

				const results = await context.db.transaction(async (tx) => {
					const processResults = [];

					for (const examAssignment of userExamsAssignedStatus) {
						const { examId, assigned } = examAssignment;

						const existingUserExam = await tx.query.userExam.findFirst({
							where: and(
								eq(userExam.userId, userId),
								eq(userExam.examId, examId),
							),
						});

						if (assigned) {
							if (!existingUserExam) {
								await tx.insert(userExam).values({
									userId,
									examId,
									assignedAt: new Date(),
									attempts: 0,
									maxAttempts: 1,
								});
							}
						} else {
							if (existingUserExam) {
								await tx
									.delete(userExam)
									.where(
										and(
											eq(userExam.userId, userId),
											eq(userExam.examId, examId),
										),
									);
							}
						}

						processResults.push({
							examId,
							assigned,
						});
					}

					return processResults;
				});

				return {
					success: true,
					message: "User exam assignments updated successfully",
					data: results,
				};
			} catch (error) {
				console.error("Error managing user exams:", error);

				if (error instanceof ORPCError) {
					throw error;
				}

				throw new ORPCError(
					error instanceof Error
						? error.message
						: "Failed to manage user exams",
					{ status: 500 },
				);
			}
		}),
	getUserExamsData: adminProcedure
		.input(GetUserExamsDataInput)
		.output(GetUserExamsDataOutput)
		.handler(async ({ context, input }) => {
			const userExamsData = await context.db.query.userExam.findMany({
				where: eq(userExam.userId, input.userId),
				with: {
					exam: true,
				},
			});

			return { userExamsData };
		}),
};
