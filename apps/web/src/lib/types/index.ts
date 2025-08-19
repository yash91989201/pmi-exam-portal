import type z from "zod";
import type { AdminLoginSchema, AdminSignupSchema } from "@/lib/schema";

export type AdminSignupSchemaType = z.infer<typeof AdminSignupSchema>;
export type AdminLoginSchemaType = z.infer<typeof AdminLoginSchema>;
