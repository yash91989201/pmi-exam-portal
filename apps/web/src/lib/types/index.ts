import type z from "zod";
import type {
	AdminSignInSchema,
	AdminSignupSchema,
	OrderFormSchema,
	UserLoginSchema,
} from "@/lib/schema";
import type { AttemptExamFormSchema } from "@/lib/schema/exam";

export type AttemptExamFormSchemaType = z.infer<typeof AttemptExamFormSchema>;

export type OrderFormSchemaType = z.infer<typeof OrderFormSchema>;
export type AdminSignupSchemaType = z.infer<typeof AdminSignupSchema>;
export type AdminSignInSchemaType = z.infer<typeof AdminSignInSchema>;
export type UserLoginSchemaType = z.infer<typeof UserLoginSchema>;
