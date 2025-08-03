import type z from "zod";
import type {
	AccountSchema,
	SessionSchema,
	UserSchema,
	VerificationSchema,
} from "@/lib/schema/auth";

export type User = z.infer<typeof UserSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type Verification = z.infer<typeof VerificationSchema>;
