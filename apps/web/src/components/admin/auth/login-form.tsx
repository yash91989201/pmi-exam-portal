import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const LoginSchema = z.object({
	email: z.email("Invalid email address").min(1, "Email is required"),
	password: z.string().min(1, "Password is required"),
});

export function AdminLoginForm() {
	const router = useRouter();
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onSubmit: LoginSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await authClient.signIn.email({
					email: value.email,
					password: value.password,
				});

				toast.success("Logged in successfully!");

				router.navigate({
					to: "/dashboard",
				});
			} catch (error) {
				console.error(error);
				toast.error("Failed to login. Please check your credentials.");
			}
		},
	});

	const togglePasswordVisibility = () => {
		setIsPasswordVisible(!isPasswordVisible);
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
									autoComplete="email"
									required
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
									autoComplete="current-password"
									required
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
								Logging In...
							</>
						) : (
							"Login"
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
