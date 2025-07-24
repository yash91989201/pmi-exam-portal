import type z from "zod"
import type {
  UserSchema,
  AccountSchema,
  SessionSchema,
  VerificationSchema
} from "./schema"

export type User = z.infer<typeof UserSchema>
export type Account = z.infer<typeof AccountSchema>
export type Session = z.infer<typeof SessionSchema>
export type Verification = z.infer<typeof VerificationSchema>
