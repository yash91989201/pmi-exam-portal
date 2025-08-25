import { z } from "zod";

export const PortalSettingsFormSchema = z.object({
	enableRegistration: z.boolean(),
	emailVerificationRequired: z.boolean(),
	enableExamMonitoring: z.boolean(),
});

