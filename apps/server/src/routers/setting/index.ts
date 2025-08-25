import { desc, eq } from "drizzle-orm";
import { user, verification } from "@/db/schema/auth";
import { adminProcedure, publicProcedure } from "@/lib/orpc";
import {
	CreateAdminInput,
	CreateAdminOutput,
	GetPortalSettingsOutput,
	RegistrationStatusOutput,
	UpdatePortalSettingsInput,
	UpdatePortalSettingsOutput,
	VerifyAdminEmailInput,
	VerifyAdminEmailOutput,
} from "@/lib/schema";
import {
	ADMIN_SETTING_KEYS,
	createAdminSettingsManager,
} from "@/utils/admin-settings-manager";

export const settingRouter = {
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
	getPortalSettings: adminProcedure
		.output(GetPortalSettingsOutput)
		.handler(async ({ context }) => {
			try {
				const adminSettingsManager = createAdminSettingsManager(context.db);
				const settings = await adminSettingsManager.getMultipleSettings([
					ADMIN_SETTING_KEYS.ENABLE_REGISTRATION,
					ADMIN_SETTING_KEYS.EMAIL_VERIFICATION_REQUIRED,
					ADMIN_SETTING_KEYS.ENABLE_EXAM_MONITORING,
				]);

				return {
					success: true,
					message: "Portal settings fetched successfully",
					data: {
						enableRegistration:
							settings[ADMIN_SETTING_KEYS.ENABLE_REGISTRATION] === "1",
						emailVerificationRequired:
							settings[ADMIN_SETTING_KEYS.EMAIL_VERIFICATION_REQUIRED] === "1",
						enableExamMonitoring:
							settings[ADMIN_SETTING_KEYS.ENABLE_EXAM_MONITORING] === "1",
					},
				};
			} catch (error) {
				return {
					success: false,
					message:
						error instanceof Error
							? error.message
							: "An unexpected error occurred",
					data: {
						enableRegistration: false,
						emailVerificationRequired: false,
						enableExamMonitoring: false,
					},
				};
			}
		}),

	updatePortalSettings: adminProcedure
		.input(UpdatePortalSettingsInput)
		.output(UpdatePortalSettingsOutput)
		.handler(async ({ context, input }) => {
			try {
				const adminSettingsManager = createAdminSettingsManager(context.db);
				await adminSettingsManager.setMultipleSettings({
					[ADMIN_SETTING_KEYS.ENABLE_REGISTRATION]: input.enableRegistration
						? "1"
						: "0",
					[ADMIN_SETTING_KEYS.EMAIL_VERIFICATION_REQUIRED]:
						input.emailVerificationRequired ? "1" : "0",
				});

				return {
					success: true,
					message: "Portal settings updated successfully",
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
};

export type SettingRouter = typeof settingRouter;
