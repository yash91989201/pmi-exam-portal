import { OrderSchema } from "@server-schemas/index";
import z from "zod";

export const OrderFormSchema = z.object({
	orders: z.array(OrderSchema),
});

export const AdminSignupSchema = z
	.object({
		email: z.email("Invalid email address").min(1, "Email is required"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
		otp: z.string().min(6, "OTP is required"),
		formState: z.object({
			otpSent: z.boolean(),
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const AdminSignInSchema = z.object({
	email: z.email("Invalid email address").min(1, "Email is required"),
	otp: z.string().min(6, "OTP is required"),
	formState: z.object({
		otpSent: z.boolean(),
	}),
});

export const UserLoginSchema = z.object({
	email: z.email("Invalid email address").min(1, "Email is required"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});
