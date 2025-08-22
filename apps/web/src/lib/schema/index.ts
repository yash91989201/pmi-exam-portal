import z from "zod";

export const AdminSignupSchema = z
	.object({
		email: z.email("Invalid email address").min(1, "Email is required"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
		name: z.string().min(2, "Name must be at least 2 characters"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const AdminLoginSchema = z.object({
	email: z.email("Invalid email address").min(1, "Email is required"),
	password: z.string().min(1, "Password is required"),
});
