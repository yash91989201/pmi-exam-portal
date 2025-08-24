import { eq } from "drizzle-orm";
import { user } from "@/db/schema/auth";
import { publicProcedure } from "@/lib/orpc";
import {
	CreateAdminInput,
	CreateAdminOutput,
	RegistrationStatusOutput,
} from "@/lib/schema";
import { createAdminSettingsManager } from "@/utils/admin-settings-manager";

export const adminSettingRouter = {
	createAdmin: publicProcedure
		.input(CreateAdminInput)
		.output(CreateAdminOutput)
		.handler(async ({ context, input }) => {
			try {
				const adminSettingsManager = createAdminSettingsManager(context.db);
				const registrationEnabled =
					await adminSettingsManager.isRegistrationEnabled();

				if (!registrationEnabled) {
					throw new Error("Admin registration is disabled");
				}

				const updateUserRes = await context.db
					.update(user)
					.set({
						role: "admin",
					})
					.where(eq(user.id, input.userId))
					.returning();

				await adminSettingsManager.disableRegistration();

				return {
					success: true,
					message:
						"First admin created successfully, and disabled further registrations.",
					data: {
						userId: updateUserRes[0].id,
					},
				};
			} catch (error) {
				return {
					success: false,
					message:
						error instanceof Error
							? error.message
							: "An unexpected error occurred",
				};
			}
		}),

	getRegistrationStatus: publicProcedure
		.output(RegistrationStatusOutput)
		.handler(async ({ context }) => {
			try {
				const adminSettingsManager = createAdminSettingsManager(context.db);
				const registrationEnabled =
					await adminSettingsManager.isRegistrationEnabled();

				return {
					success: true,
					message: "Fetched registration status successfully",
					data: { registrationEnabled },
				};
			} catch (error) {
				return {
					success: false,
					message:
						error instanceof Error
							? error.message
							: "Admin registration is disabled currently.",
				};
			}
		}),
};

export type AdminSettingRouter = typeof adminSettingRouter;
