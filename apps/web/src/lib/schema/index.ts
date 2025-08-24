import { OrderSchema } from "@server-schemas/index";
import z from "zod";

export const OrderFormSchema = z.object({
	orders: z.array(OrderSchema),
});

export const AdminSignInSchema = z.object({
	email: z.email("Invalid email address").min(1, "Email is required"),
	otp: z.string().min(6, "OTP is required").optional(),
	formState: z.object({
		otpSent: z.boolean(),
	}),
});
