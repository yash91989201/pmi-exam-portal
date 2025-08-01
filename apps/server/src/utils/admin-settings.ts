import { eq } from "drizzle-orm";
import { ADMIN_SETTINGS, DEFAULT_ADMIN_ID } from "@/constants";
import { db } from "@/db";
import { adminSetting } from "@/db/schema";
import { user } from "@/db/schema/auth";

export const getAdminSetting = async (key: string): Promise<string> => {
	try {
		const result = await db.query.adminSetting.findFirst({
			where: eq(adminSetting.key, key),
		});

		if (!result) {
			const setting = ADMIN_SETTINGS[key as keyof typeof ADMIN_SETTINGS];
			const defaultValue = setting?.default || "";

			try {
				await db.insert(adminSetting).values({ key, value: defaultValue });
			} catch (insertError) {
				console.error("Error inserting default admin setting:", insertError);
			}

			return defaultValue;
		}

		return result.value;
	} catch (error) {
		console.error("Error getting admin setting:", error);
		const setting = ADMIN_SETTINGS[key as keyof typeof ADMIN_SETTINGS];
		return setting?.default || "";
	}
};

export const setAdminSetting = async (
	key: string,
	value: string,
): Promise<void> => {
	try {
		const existing = await db.query.adminSetting.findFirst({
			where: eq(adminSetting.key, key),
		});

		if (existing) {
			await db
				.update(adminSetting)
				.set({ value })
				.where(eq(adminSetting.key, key));
		} else {
			await db.insert(adminSetting).values({ key, value });
		}
	} catch (error) {
		console.error("Error setting admin setting:", error);
		throw error;
	}
};

export const isRegistrationEnabled = async (): Promise<boolean> => {
	const value = await getAdminSetting("enable_registration");
	return value === "1";
};

export const toggleRegistration = async (enabled: boolean): Promise<void> => {
	await setAdminSetting("enable_registration", enabled ? "1" : "0");
};

export const updateDefaultAdmin = async (
	generatedId: string,
): Promise<void> => {
	try {
		await db
			.update(user)
			.set({
				id: DEFAULT_ADMIN_ID,
				role: "admin",
			})
			.where(eq(user.id, generatedId));
	} catch (error) {
		console.error("Error updating default admin:", error);
		throw error;
	}
};
