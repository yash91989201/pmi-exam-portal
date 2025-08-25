import { eq } from "drizzle-orm";
import { ADMIN_SETTINGS, DEFAULT_ADMIN_ID } from "@/constants";
import type { DBType } from "@/db";
import { adminSetting } from "@/db/schema";
import { user } from "@/db/schema/auth";

// Admin setting keys with their default values - add more keys here as needed
export const ADMIN_SETTING_KEYS = {
	ENABLE_REGISTRATION: "enable_registration",
	EMAIL_VERIFICATION_REQUIRED: "email_verification_required",
	ENABLE_EXAM_MONITORING: "enable_exam_monitoring",
} as const;

// Default values for admin settings
export const ADMIN_SETTING_DEFAULTS: Record<string, string> = {
	[ADMIN_SETTING_KEYS.ENABLE_REGISTRATION]: "1",
	[ADMIN_SETTING_KEYS.EMAIL_VERIFICATION_REQUIRED]: "1",
	[ADMIN_SETTING_KEYS.ENABLE_EXAM_MONITORING]: "0",
} as const;

export type AdminSettingKey =
	(typeof ADMIN_SETTING_KEYS)[keyof typeof ADMIN_SETTING_KEYS];

export class AdminSettingsManager {
	private static instance: AdminSettingsManager;
	private cache: Map<string, string> = new Map();
	private cacheExpiry: Map<string, number> = new Map();
	private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
	private db: DBType;

	private constructor(db: DBType) {
		this.db = db;
	}

	public static getInstance(db?: DBType): AdminSettingsManager {
		if (!AdminSettingsManager.instance) {
			if (!db) {
				throw new Error(
					"Database instance is required when creating AdminSettingsManager for the first time",
				);
			}
			AdminSettingsManager.instance = new AdminSettingsManager(db);
		}
		return AdminSettingsManager.instance;
	}

	/**
	 * Get an admin setting value by key
	 * @param key - The setting key
	 * @param useCache - Whether to use caching (default: true)
	 * @returns Promise<string> - The setting value (never null/undefined)
	 */
	public async getSetting(key: string, useCache = true): Promise<string> {
		// Check cache first if enabled
		if (useCache && this.isValidCache(key)) {
			return this.cache.get(key) as string; // Safe assertion since isValidCache checks existence
		}

		try {
			const result = await this.db.query.adminSetting.findFirst({
				where: eq(adminSetting.key, key),
			});

			let value: string;
			if (!result) {
				// Use our internal defaults first, then fallback to ADMIN_SETTINGS
				const defaultValue =
					ADMIN_SETTING_DEFAULTS[key] ||
					ADMIN_SETTINGS[key as keyof typeof ADMIN_SETTINGS]?.default ||
					"";

				try {
					await this.db
						.insert(adminSetting)
						.values({ key, value: defaultValue });
				} catch (insertError) {
					console.error("Error inserting default admin setting:", insertError);
				}

				value = defaultValue;
			} else {
				value = result.value;
			}

			// Cache the result
			if (useCache) {
				this.setCache(key, value);
			}

			return value;
		} catch (error) {
			console.error("Error getting admin setting:", error);
			// Return default value on error
			return (
				ADMIN_SETTING_DEFAULTS[key] ||
				ADMIN_SETTINGS[key as keyof typeof ADMIN_SETTINGS]?.default ||
				""
			);
		}
	}

	/**
	 * Set an admin setting value
	 * @param key - The setting key
	 * @param value - The setting value
	 */
	public async setSetting(key: string, value: string): Promise<void> {
		try {
			const existing = await this.db.query.adminSetting.findFirst({
				where: eq(adminSetting.key, key),
			});

			if (existing) {
				await this.db
					.update(adminSetting)
					.set({ value })
					.where(eq(adminSetting.key, key));
			} else {
				await this.db.insert(adminSetting).values({ key, value });
			}

			// Update cache
			this.setCache(key, value);
		} catch (error) {
			console.error("Error setting admin setting:", error);
			throw error;
		}
	}

	/**
	 * Get a setting value with proper type casting
	 * @param key - The setting key
	 * @param useCache - Whether to use caching (default: true)
	 * @returns Promise<boolean> - The setting value as boolean
	 */
	public async getBooleanSetting(
		key: string,
		useCache = true,
	): Promise<boolean> {
		const value = await this.getSetting(key, useCache);
		return value === "1" || value.toLowerCase() === "true";
	}

	/**
	 * Get a setting value as number
	 * @param key - The setting key
	 * @param useCache - Whether to use caching (default: true)
	 * @returns Promise<number> - The setting value as number (0 if invalid)
	 */
	public async getNumberSetting(key: string, useCache = true): Promise<number> {
		const value = await this.getSetting(key, useCache);
		const parsed = Number.parseInt(value, 10);
		return Number.isNaN(parsed) ? 0 : parsed;
	}

	/**
	 * Set a boolean setting
	 * @param key - The setting key
	 * @param value - The boolean value to set
	 */
	public async setBooleanSetting(key: string, value: boolean): Promise<void> {
		await this.setSetting(key, value ? "1" : "0");
	}

	/**
	 * Set a number setting
	 * @param key - The setting key
	 * @param value - The number value to set
	 */
	public async setNumberSetting(key: string, value: number): Promise<void> {
		await this.setSetting(key, value.toString());
	}
	/**
	 * @param keys - Array of setting keys
	 * @returns Promise<Record<string, string>> - Object with key-value pairs
	 */
	public async getMultipleSettings(
		keys: string[],
	): Promise<Record<string, string>> {
		const results: Record<string, string> = {};

		// Use Promise.all for parallel execution
		const settingPromises = keys.map(async (key) => {
			const value = await this.getSetting(key);
			return { key, value };
		});

		const settingResults = await Promise.all(settingPromises);

		settingResults.forEach(({ key, value }) => {
			results[key] = value;
		});

		return results;
	}

	/**
	 * Set multiple settings at once
	 * @param settings - Object with key-value pairs to set
	 */
	public async setMultipleSettings(
		settings: Record<string, string>,
	): Promise<void> {
		const settingPromises = Object.entries(settings).map(([key, value]) =>
			this.setSetting(key, value),
		);

		await Promise.all(settingPromises);
	}

	/**
	 * Check if registration is enabled
	 * @returns Promise<boolean> - Whether registration is enabled
	 */
	public async isRegistrationEnabled(): Promise<boolean> {
		return await this.getBooleanSetting(ADMIN_SETTING_KEYS.ENABLE_REGISTRATION);
	}

	/**
	 * Enable admin registration
	 */
	public async enableRegistration(): Promise<void> {
		await this.setBooleanSetting(ADMIN_SETTING_KEYS.ENABLE_REGISTRATION, true);
	}

	/**
	 * Disable admin registration
	 */
	public async disableRegistration(): Promise<void> {
		await this.setBooleanSetting(ADMIN_SETTING_KEYS.ENABLE_REGISTRATION, false);
	}

	/**
	 * Toggle registration on/off
	 * @param enabled - Whether to enable registration
	 */
	public async toggleRegistration(enabled: boolean): Promise<void> {
		await this.setBooleanSetting(
			ADMIN_SETTING_KEYS.ENABLE_REGISTRATION,
			enabled,
		);
	}

	/**
	 * Check if email verification is required
	 * @returns Promise<boolean> - Whether email verification is required
	 */
	public async isEmailVerificationRequired(): Promise<boolean> {
		return await this.getBooleanSetting(
			ADMIN_SETTING_KEYS.EMAIL_VERIFICATION_REQUIRED,
		);
	}

	/**
	 * Toggle email verification requirement
	 * @param required - Whether to require email verification
	 */
	public async toggleEmailVerification(required: boolean): Promise<void> {
		await this.setBooleanSetting(
			ADMIN_SETTING_KEYS.EMAIL_VERIFICATION_REQUIRED,
			required,
		);
	}
	/**
	 * @param generatedId - The current user ID to update to default admin
	 */
	public async updateDefaultAdmin(generatedId: string): Promise<void> {
		try {
			await this.db
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
	}

	/**
	 * Clear cache for a specific key or all keys
	 * @param key - Optional key to clear, if not provided clears all cache
	 */
	public clearCache(key?: string): void {
		if (key) {
			this.cache.delete(key);
			this.cacheExpiry.delete(key);
		} else {
			this.cache.clear();
			this.cacheExpiry.clear();
		}
	}

	/**
	 * Get all admin settings
	 * @param useCache - Whether to use caching
	 * @returns Promise<Record<string, string>> - All settings as key-value pairs
	 */
	public async getAllSettings(
		useCache = true,
	): Promise<Record<string, string>> {
		try {
			const results = await this.db.query.adminSetting.findMany();
			const settings: Record<string, string> = {};

			results.forEach(({ key, value }) => {
				settings[key] = value;
				if (useCache) {
					this.setCache(key, value);
				}
			});

			return settings;
		} catch (error) {
			console.error("Error getting all admin settings:", error);
			return {};
		}
	}

	/**
	 * Check if a setting exists
	 * @param key - The setting key to check
	 * @returns Promise<boolean> - Whether the setting exists
	 */
	public async settingExists(key: string): Promise<boolean> {
		try {
			const result = await this.db.query.adminSetting.findFirst({
				where: eq(adminSetting.key, key),
			});
			return !!result;
		} catch (error) {
			console.error("Error checking if setting exists:", error);
			return false;
		}
	}

	/**
	 * Delete a setting
	 * @param key - The setting key to delete
	 */
	public async deleteSetting(key: string): Promise<void> {
		try {
			await this.db.delete(adminSetting).where(eq(adminSetting.key, key));
			this.clearCache(key);
		} catch (error) {
			console.error("Error deleting admin setting:", error);
			throw error;
		}
	}

	/**
	 * Get default value for a setting key
	 * @param key - The setting key
	 * @returns string - The default value for the key
	 */
	public getDefaultValue(key: string): string {
		return (
			ADMIN_SETTING_DEFAULTS[key] ||
			ADMIN_SETTINGS[key as keyof typeof ADMIN_SETTINGS]?.default ||
			""
		);
	}

	/**
	 * Reset a setting to its default value
	 * @param key - The setting key to reset
	 */
	public async resetSettingToDefault(key: string): Promise<void> {
		const defaultValue = this.getDefaultValue(key);
		await this.setSetting(key, defaultValue);
	}

	/**
	 * Reset all settings to their default values
	 */
	public async resetAllSettingsToDefaults(): Promise<void> {
		const resetPromises = Object.keys(ADMIN_SETTING_DEFAULTS).map((key) =>
			this.resetSettingToDefault(key),
		);
		await Promise.all(resetPromises);
	}
	private isValidCache(key: string): boolean {
		const cached = this.cache.has(key);
		const expiry = this.cacheExpiry.get(key);

		if (!cached || !expiry) {
			return false;
		}

		if (Date.now() > expiry) {
			this.cache.delete(key);
			this.cacheExpiry.delete(key);
			return false;
		}

		return true;
	}

	private setCache(key: string, value: string): void {
		this.cache.set(key, value);
		this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
	}
}

// Export a convenience function to create/get instance
export const createAdminSettingsManager = (db: DBType) =>
	AdminSettingsManager.getInstance(db);
