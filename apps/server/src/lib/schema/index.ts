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
