import { desc, eq } from "drizzle-orm";
import { user, verification } from "@/db/schema/auth";
import { publicProcedure } from "@/lib/orpc";
import {
	CreateAdminInput,
	CreateAdminOutput,
	RegistrationStatusOutput,
	VerifyAdminEmailInput,
	VerifyAdminEmailOutput,
} from "@/lib/schema";
import { createAdminSettingsManager } from "@/utils/admin-settings-manager";

export const adminSettingRouter = {
	verifyEmail: publicProcedure
		.input(VerifyAdminEmailInput)
		.output(VerifyAdminEmailOutput)
		.handler(async ({ context, input }) => {
			try {
				const existingVerifications =
					await context.db.query.verification.findMany({
						where: eq(
							verification.identifier,
							`email-verification-otp-${input.email}`,
						),
						orderBy: [desc(verification.createdAt)],
						limit: 1,
					});
				const existingVerification = existingVerifications[0];

				if (!existingVerification) {
					throw new Error("OTP not found, try again!");
				}

				if (existingVerification.value !== `${input.otp}:0`) {
					throw new Error("Invalid OTP, try again!");
				}

				return {
					success: true,
					message: "Email verified successfully",
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
