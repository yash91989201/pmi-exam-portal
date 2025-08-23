import type z from "zod";
import type {
	AdminLoginSchema,
	AdminSignupSchema,
	OrderFormSchema,
} from "@/lib/schema";
import type { AttemptExamFormSchema } from "@/lib/schema/exam";

export type AdminSignupSchemaType = z.infer<typeof AdminSignupSchema>;
export type AdminLoginSchemaType = z.infer<typeof AdminLoginSchema>;

export type AttemptExamFormSchemaType = z.infer<typeof AttemptExamFormSchema>;

export type OrderFormSchemaType = z.infer<typeof OrderFormSchema>;
