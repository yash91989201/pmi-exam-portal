import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { AdminSignupSchema } from "@/lib/schema";
import type { AdminSignupSchemaType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { orpcClient } from "@/utils/orpc";

export function SignUpForm() {
	const router = useRouter();
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState(false);

	const { mutateAsync: disableAdminRegistration } = useMutation({
		mutationFn: async () => {
			return orpcClient.admin.toggleRegistration({ enabled: false });
		},
	});

	const { mutateAsync: updateDefaultAdmin } = useMutation({
		mutationFn: orpcClient.admin.updateDefaultAdmin,
	});

	const form = useForm<AdminSignupSchemaType>({
		resolver: zodResolver(AdminSignupSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			name: "",
		},
	});

	const onSubmit: SubmitHandler<AdminSignupSchemaType> = async (values) => {
		try {
			const signupRes = await authClient.signUp.email({
				name: values.name,
				email: values.email,
				password: values.password,
			});

			if (signupRes.error) {
				throw new Error(signupRes.error.message);
			}

			await updateDefaultAdmin({ generatedId: signupRes.data.user.id });

			await disableAdminRegistration();

			toast.success("First Admin account created successfully!");

			router.navigate({ to: "/dashboard" });
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to create admin account. Please try again.",
			);
		}
	};

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-5"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				{/* Full Name */}
				<Card className="border-none p-0 shadow-none">
					<FormField
						control={form.control}
						name="name"
						render={({ field, fieldState }) => (
							<FormItem>
								<Label htmlFor="name" className="font-medium">
									Full Name
								</Label>
								<FormControl>
									<div className="relative">
										<div className="absolute top-2.5 left-3 text-muted-foreground">
											<User size={18} strokeWidth={2} />
										</div>
										<Input
											placeholder="John Doe"
											autoComplete="name"
											autoFocus
											{...field}
											className={cn(
												"pl-9 transition-all",
												fieldState.error &&
													"border-destructive focus-visible:ring-destructive",
											)}
										/>
									</div>
								</FormControl>
								{fieldState.error && (
									<p className="text-destructive text-sm">
										{fieldState.error.message}
									</p>
								)}
							</FormItem>
						)}
					/>
				</Card>

				{/* Email */}
				<Card className="border-none p-0 shadow-none">
					<FormField
						control={form.control}
						name="email"
						render={({ field, fieldState }) => (
							<FormItem>
								<Label htmlFor="email" className="font-medium">
									Email Address
								</Label>
								<FormControl>
									<div className="relative">
										<div className="absolute top-2.5 left-3 text-muted-foreground">
											<Mail size={18} strokeWidth={2} />
										</div>
										<Input
											placeholder="name@example.com"
											type="email"
											autoComplete="email"
											{...field}
											className={cn(
												"pl-9 transition-all",
												fieldState.error &&
													"border-destructive focus-visible:ring-destructive",
											)}
										/>
									</div>
								</FormControl>
								{fieldState.error && (
									<p className="text-destructive text-sm">
										{fieldState.error.message}
									</p>
								)}
							</FormItem>
						)}
					/>
				</Card>

				{/* Password */}
				<Card className="border-none p-0 shadow-none">
					<FormField
						control={form.control}
						name="password"
						render={({ field, fieldState }) => (
							<FormItem>
								<Label htmlFor="password" className="font-medium">
									Password
								</Label>
								<FormControl>
									<div className="relative">
										<div className="absolute top-2.5 left-3 text-muted-foreground">
											<Lock size={18} strokeWidth={2} />
										</div>
										<Input
											placeholder="••••••••"
											type={isPasswordVisible ? "text" : "password"}
											autoComplete="new-password"
											{...field}
											className={cn(
												"pl-9 transition-all",
												fieldState.error &&
													"border-destructive focus-visible:ring-destructive",
											)}
										/>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => setIsPasswordVisible((prev) => !prev)}
											className="absolute top-1 right-1 h-8 w-8 text-muted-foreground transition-colors hover:text-foreground"
										>
											{isPasswordVisible ? (
												<EyeOff size={16} />
											) : (
												<Eye size={16} />
											)}
										</Button>
									</div>
								</FormControl>
								{fieldState.error && (
									<p className="text-destructive text-sm">
										{fieldState.error.message}
									</p>
								)}
								<p className="text-muted-foreground text-xs">
									Password must be at least 8 characters long
								</p>
							</FormItem>
						)}
					/>
				</Card>

				{/* Confirm Password */}
				<Card className="border-none p-0 shadow-none">
					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field, fieldState }) => (
							<FormItem>
								<Label htmlFor="confirmPassword" className="font-medium">
									Confirm Password
								</Label>
								<FormControl>
									<div className="relative">
										<div className="absolute top-2.5 left-3 text-muted-foreground">
											<Lock size={18} strokeWidth={2} />
										</div>
										<Input
											placeholder="••••••••"
											type={isConfirmPasswordVisible ? "text" : "password"}
											autoComplete="new-password"
											{...field}
											className={cn(
												"pl-9 transition-all",
												fieldState.error &&
													"border-destructive focus-visible:ring-destructive",
											)}
										/>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() =>
												setIsConfirmPasswordVisible((prev) => !prev)
											}
											className="absolute top-1 right-1 h-8 w-8 text-muted-foreground transition-colors hover:text-foreground"
										>
											{isConfirmPasswordVisible ? (
												<EyeOff size={16} />
											) : (
												<Eye size={16} />
											)}
										</Button>
									</div>
								</FormControl>
								{fieldState.error && (
									<p className="text-destructive text-sm">
										{fieldState.error.message}
									</p>
								)}
							</FormItem>
						)}
					/>
				</Card>

				{/* Submit Button */}
				<Button
					type="submit"
					className="mt-2 w-full transition-all"
					disabled={form.formState.isSubmitting}
				>
					{form.formState.isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Creating Admin Account...
						</>
					) : (
						"Create Admin Account"
					)}
				</Button>
			</form>
		</Form>
	);
}
