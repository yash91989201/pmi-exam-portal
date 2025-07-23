import type z from "zod"
import type { UserSchema, SessionSchema, VerificationSchema, AccountSchema } from "@/schema/auth";

export type User = z.infer<typeof UserSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type Verification = z.infer<typeof VerificationSchema>;

export type AuthContext = {
  user: User;
  session: Session;
} | null;
