import { createEnv } from "@t3-oss/env-core";
import { defineConfig } from "drizzle-kit";
import z from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.url(),
	},

	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
	},

	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});

export default defineConfig({
	schema: "./src/db/schema",
	out: "./src/db/migrations",
	dialect: "postgresql",
	casing: "snake_case",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
