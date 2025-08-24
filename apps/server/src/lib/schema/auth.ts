import { createSelectSchema } from "drizzle-zod";
import z from "zod";
import { account, session, user, verification } from "../../db/schema/auth";

export const UserSchema = createSelectSchema(user);
export const SessionSchema = createSelectSchema(session);
export const AccountSchema = createSelectSchema(account);
export const VerificationSchema = createSelectSchema(verification);

export const VerifyAdminEmailInput = z.object({
	email: z.email("Invalid email address"),
	otp: z.string().min(6, "OTP must be at least 6 characters long"),
});

export const VerifyAdminEmailOutput = z.object({
	success: z.boolean(),
	message: z.string(),
});
