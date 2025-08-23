import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
	server: {
		VITE_ALLOWED_HOSTS: z
			.string()
			.transform((val) => {
				return val
					.split(",")
					.map((url) => url.trim())
					.filter((url) => url.length > 0);
			})
			.pipe(z.array(z.url())),
		VITE_SERVER_URL: z.url(),
	},

	runtimeEnv: import.meta.env,

	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
