import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { AdminSignupSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { orpcClient } from "@/utils/orpc";

export function SignUpForm() {
	const router = useRouter();
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState(false);

	const { mutateAsync: disableAdminRegistration } = useMutation({
		mutationFn: async () => {
			return orpcClient.adminSetting.toggleRegistration({ enabled: false });
		},
	});

	const { mutateAsync: updateDefaultAdmin } = useMutation({
		mutationFn: orpcClient.adminSetting.updateDefaultAdmin,
	});

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			name: "",
		},
		validators: {
			onSubmit: AdminSignupSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const signupRes = await authClient.signUp.email({
					name: value.name,
					email: value.email,
					password: value.password,
				});

				if (signupRes.error) {
					throw new Error(signupRes.error.message);
				}

				await updateDefaultAdmin({ generatedId: signupRes.data.user.id });

				await disableAdminRegistration();

				toast.success("First Admin account created successfully!");

				router.navigate({
					to: "/admin",
				});
			} catch (error) {
				console.error(error);

				toast.error(
					error instanceof Error
						? error.message
						: "Failed to create admin account. Please try again.",
				);
			}
		},
	});

	const togglePasswordVisibility = () => {
		setIsPasswordVisible(!isPasswordVisible);
	};

	const toggleConfirmPasswordVisibility = () => {
		setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
	};

	return (
		<form
			className="flex flex-col gap-5"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<Card className="border-none p-0 shadow-none">
				<form.Field name="name">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="name" className="font-medium">
								Full Name
							</Label>
							<div className="relative">
								<div className="absolute top-2.5 left-3 text-muted-foreground">
									<User size={18} strokeWidth={2} />
								</div>
								<Input
									id="name"
									placeholder="John Doe"
									type="text"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									className={cn(
										"pl-9 transition-all",
										field.state.meta.errors?.length &&
											"border-destructive focus-visible:ring-destructive",
									)}
									required
									autoComplete="name"
									autoFocus
								/>
							</div>
							{field.state.meta.errors?.length > 0 && (
								<p className="text-destructive text-sm">
									{field.state.meta.errors.join(", ")}
								</p>
							)}
						</div>
					)}
				</form.Field>
			</Card>

			<Card className="border-none p-0 shadow-none">
				<form.Field name="email">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="email" className="font-medium">
								Email Address
							</Label>
							<div className="relative">
								<div className="absolute top-2.5 left-3 text-muted-foreground">
									<Mail size={18} strokeWidth={2} />
								</div>
								<Input
									id="email"
									placeholder="name@example.com"
									type="email"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									className={cn(
										"pl-9 transition-all",
										field.state.meta.errors?.length &&
											"border-destructive focus-visible:ring-destructive",
									)}
									required
									autoComplete="email"
								/>
							</div>
							{field.state.meta.errors?.length > 0 && (
								<p className="text-destructive text-sm">
									{field.state.meta.errors.join(", ")}
								</p>
							)}
						</div>
					)}
				</form.Field>
			</Card>

			<Card className="border-none p-0 shadow-none">
				<form.Field name="password">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="password" className="font-medium">
								Password
							</Label>
							<div className="relative">
								<div className="absolute top-2.5 left-3 text-muted-foreground">
									<Lock size={18} strokeWidth={2} />
								</div>
								<Input
									id="password"
									placeholder="••••••••"
									type={isPasswordVisible ? "text" : "password"}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									className={cn(
										"pl-9 transition-all",
										field.state.meta.errors?.length &&
											"border-destructive focus-visible:ring-destructive",
									)}
									required
									autoComplete="new-password"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={togglePasswordVisibility}
									className="absolute top-1 right-1 h-8 w-8 text-muted-foreground transition-colors hover:text-foreground"
								>
									{isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
								</Button>
							</div>
							{field.state.meta.errors?.length > 0 && (
								<p className="text-destructive text-sm">
									{field.state.meta.errors.join(", ")}
								</p>
							)}
							<p className="text-muted-foreground text-xs">
								Password must be at least 8 characters long
							</p>
						</div>
					)}
				</form.Field>
			</Card>

			<Card className="border-none p-0 shadow-none">
				<form.Field name="confirmPassword">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="confirmPassword" className="font-medium">
								Confirm Password
							</Label>
							<div className="relative">
								<div className="absolute top-2.5 left-3 text-muted-foreground">
									<Lock size={18} strokeWidth={2} />
								</div>
								<Input
									id="confirmPassword"
									placeholder="••••••••"
									type={isConfirmPasswordVisible ? "text" : "password"}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									className={cn(
										"pl-9 transition-all",
										field.state.meta.errors?.length &&
											"border-destructive focus-visible:ring-destructive",
									)}
									required
									autoComplete="new-password"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={toggleConfirmPasswordVisibility}
									className="absolute top-1 right-1 h-8 w-8 text-muted-foreground transition-colors hover:text-foreground"
								>
									{isConfirmPasswordVisible ? (
										<EyeOff size={16} />
									) : (
										<Eye size={16} />
									)}
								</Button>
							</div>
							{field.state.meta.errors?.length > 0 && (
								<p className="text-destructive text-sm">
									{field.state.meta.errors.join(", ")}
								</p>
							)}
						</div>
					)}
				</form.Field>
			</Card>

			<form.Subscribe>
				{({ isSubmitting }) => (
					<Button
						type="submit"
						className="mt-2 w-full transition-all"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating Admin Account...
							</>
						) : (
							"Create Admin Account"
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
