import { z } from "zod";

export const PortalSettingsSchema = z.object({
	enableRegistration: z.boolean(),
	emailVerificationRequired: z.boolean(),
	enableExamMonitoring: z.boolean(),
});

export const GetPortalSettingsOutput = z.object({
	success: z.boolean(),
	message: z.string(),
	data: PortalSettingsSchema.optional(),
});

export const UpdatePortalSettingsInput = PortalSettingsSchema;

export const UpdatePortalSettingsOutput = z.object({
	success: z.boolean(),
	message: z.string(),
});

