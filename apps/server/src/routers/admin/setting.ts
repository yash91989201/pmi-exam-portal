import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema/auth";
import { publicProcedure } from "@/lib/orpc";
import {
	RegistrationStatusOutput,
	ToggleRegistrationInput,
	ToggleRegistrationOutput,
	UpdateDefaultAdminIdInput,
	UpdateDefaultAdminIdOutput,
} from "@/lib/schema";
import {
	isRegistrationEnabled,
	toggleRegistration,
} from "@/utils/admin-settings";

export const adminSettingRouter = {
	toggleRegistration: publicProcedure
		.input(ToggleRegistrationInput)
		.output(ToggleRegistrationOutput)
		.handler(async ({ input }) => {
			try {
				await toggleRegistration(input.enabled);
				return {
					success: true,
					message: "Registration toggled successfully",
				};
			} catch (error) {
				console.error(error);
				return {
					success: false,
					message:
						error instanceof Error
							? error.message
							: "An unexpected error occurred",
				};
			}
		}),

	registrationEnabled: publicProcedure
		.output(RegistrationStatusOutput)
		.handler(async () => {
			try {
				const enabled = await isRegistrationEnabled();

				return {
					success: true,
					data: { enabled },
				};
			} catch (error) {
				console.error(error);

				return {
					success: false,
					message:
						error instanceof Error
							? error.message
							: "Admin registration is disabled",
				};
			}
		}),

	updateDefaultAdmin: publicProcedure
		.input(UpdateDefaultAdminIdInput)
		.output(UpdateDefaultAdminIdOutput)
		.handler(async ({ context, input }) => {
			try {
				await context.db
					.update(user)
					.set({
						role: "admin",
					})
					.where(eq(user.id, input.generatedId));
				return {
					success: true,
					message: "Default admin updated successfully",
				};
			} catch (error) {
				throw new ORPCError(
					error instanceof Error
						? error.message
						: "Unable to update default admin.",
					{ status: 400 },
				);
			}
		}),
};
