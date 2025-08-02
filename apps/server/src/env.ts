import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.url(),
		BETTER_AUTH_SECRET: z.string(),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		RESEND_API_KEY: z.string(),
	},

	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
		CORS_ORIGIN: process.env.CORS_ORIGIN,
		RESEND_API_KEY: process.env.RESEND_API_KEY,
	},

	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
