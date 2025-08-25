import type { UserWithRole } from "better-auth/plugins";
import { createSelectSchema } from "drizzle-zod";
import z from "zod";
import { orders, userOrders } from "../../db/schema";
import { ExamSchema, UserExamSchema } from "./exam";

export * from "./auth";
export * from "./exam";
export * from "./setting";

export const OrderSchema = createSelectSchema(orders);
export const UserOrderSchema = createSelectSchema(userOrders);

export const ToggleRegistrationInput = z.object({
	enabled: z.boolean(),
});

export const ToggleRegistrationOutput = z.object({
	success: z.boolean(),
	message: z.string().optional(),
});

export const RegistrationStatusOutput = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z
		.object({
			registrationEnabled: z.boolean(),
		})
		.optional(),
});

export const CreateAdminInput = z.object({
	userId: z.string(),
});

export const CreateAdminOutput = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z
		.object({
			userId: z.string(),
		})
		.optional(),
});

export const UpdateDefaultAdminIdInput = z.object({
	generatedId: z.string(),
});

export const UpdateDefaultAdminIdOutput = z.object({
	success: z.boolean(),
	message: z.string(),
});

export const ListUsersInput = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(10),
});

export const ListUsersOutput = z.object({
	users: z.array(z.custom<UserWithRole>()),
	total: z.number(),
	page: z.number(),
	totalPages: z.number(),
	hasNextPage: z.boolean(),
	hasPreviousPage: z.boolean(),
});

export const GetUserInput = z.object({
	userId: z.string(),
});

export const ListUserExamsOutput = z.object({
	userExams: z.array(
		UserExamSchema.extend({
			exam: ExamSchema,
		}),
	),
});

export const UpdateOrdersInput = z.object({
	orders: z.array(OrderSchema),
});

export const UpdateOrdersOutput = z.object({
	success: z.boolean(),
	message: z.string().optional(),
});

export const ListUserOrdersOutput = z.object({
	userOrders: z.array(UserOrderSchema),
});

export const GetUserOrdersInput = z.object({
	userId: z.string(),
});

export const GetUserOrdersOutput = z.object({
	userOrders: z.array(UserOrderSchema),
});

export const ManageUserOrdersInput = z.object({
	userId: z.string(),
	orders: z.array(
		z.object({
			id: z.string(),
			orderText: z.string().min(1),
			orderPriority: z.number(),
			isCompleted: z.boolean(),
		}),
	),
});

export type ManageUserOrdersInputType = z.infer<typeof ManageUserOrdersInput>;

export const ManageUserOrdersOutput = z.object({
	success: z.boolean(),
	message: z.string(),
});
