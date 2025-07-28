import { eq } from "drizzle-orm";
import { ADMIN_SETTING_KEYS, DEFAULT_ADMIN_ID } from "@/constants";
import { adminSetting as adminSettingTable } from "@/db/schema";
import { adminProcedure } from "@/lib/orpc";
import {
	ToggleRegistrationInput,
	ToggleRegistrationOutput,
} from "@/lib/schema";

export const adminSetting = {
	toggleRegistration: adminProcedure
		.input(ToggleRegistrationInput)
		.output(ToggleRegistrationOutput)
		.handler(async ({ context, input }) => {
			try {
				const admin = context.session.user;
				if (admin.id !== DEFAULT_ADMIN_ID) {
					return {
						success: false,
						message: "You do not have permission to perform this action",
					};
				}

				await context.db
					.update(adminSettingTable)
					.set({
						value:
							ADMIN_SETTING_KEYS.enableRegistration.values[
								input.enabled ? 1 : 0
							],
					})
					.where(
						eq(
							adminSettingTable.key,
							ADMIN_SETTING_KEYS.enableRegistration.key,
						),
					);

				return {
					success: true,
					message: "Registration toggled successfully",
				};
			} catch (error) {
				if (error instanceof Error) {
					return {
						success: false,
						message: error.message,
					};
				}
				return {
					success: false,
					message: "An unexpected error occurred",
				};
			}
		}),
};
