import type z from "zod";
import type { AdminSignInSchema, OrderFormSchema } from "@/lib/schema";
import type { AttemptExamFormSchema } from "@/lib/schema/exam";

export type AttemptExamFormSchemaType = z.infer<typeof AttemptExamFormSchema>;

export type OrderFormSchemaType = z.infer<typeof OrderFormSchema>;
export type AdminSignInSchemaType = z.infer<typeof AdminSignInSchema>;
