import type { UserWithRole } from "better-auth/plugins";
import z from "zod";

export * from "./auth";
export * from "./exam";

export const ToggleRegistrationInput = z.object({
	enabled: z.boolean(),
});

export const ToggleRegistrationOutput = z.object({
	success: z.boolean(),
	message: z.string().optional(),
});

export const RegistrationStatusOutput = z.object({
	success: z.boolean(),
	message: z.string().optional(),
	data: z
		.object({
			enabled: z.boolean(),
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
