import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema/auth";
import { env } from "@/env";
import {
	sendEmailVerificationOtp,
	sendPasswordResetOtp,
	sendSignInOtp,
} from "@/utils/email";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	trustedOrigins: [env.CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
	},
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	plugins: [
		admin(),
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				if (type === "sign-in") {
					await sendSignInOtp({ email, otp });
				} else if (type === "email-verification") {
					await sendEmailVerificationOtp({ email, otp });
				} else {
					await sendPasswordResetOtp({ email, otp });
				}
			},
		}),
	],
});
