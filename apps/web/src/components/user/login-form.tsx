import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "@tanstack/react-router";
import {
	ArrowRight,
	Eye,
	EyeOff,
	Loader2,
	Lock,
	Mail,
	User,
} from "lucide-react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { AdminLoginSchema } from "@/lib/schema";
import type { AdminLoginSchemaType } from "@/lib/types";

export function UserLoginForm() {
	const router = useRouter();
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);

	const form = useForm<AdminLoginSchemaType>({
		resolver: standardSchemaResolver(AdminLoginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit: SubmitHandler<AdminLoginSchemaType> = async (formData) => {
		try {
			await authClient.signIn.email({
				email: formData.email,
				password: formData.password,
				rememberMe,
			});

			toast.success("Welcome back! Logged in successfully.");
			router.navigate({ to: "/exams" });
		} catch (error) {
			console.error(error);
			toast.error("Invalid credentials. Please check your email and password.");
		}
	};

	return (
		<Card className="mx-auto w-full max-w-md border-border bg-card shadow-lg transition-all duration-300 hover:shadow-primary/10 hover:shadow-xl">
			<CardHeader className="space-y-1 text-center">
				<div className="mx-auto mb-2 w-fit rounded-full bg-primary/10 p-3 transition-colors duration-300">
					<User className="h-6 w-6 text-primary" />
				</div>
				<CardTitle className="font-bold text-2xl text-card-foreground">
					Welcome Back
				</CardTitle>
				<CardDescription className="text-muted-foreground">
					Sign in to your account to access your PMI exam preparation
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<Form {...form}>
					<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-medium text-foreground text-sm">
										Email Address
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground transition-colors duration-200" />
											<Input
												placeholder="Enter your email"
												{...field}
												className="border-border bg-background pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
											/>
										</div>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-medium text-foreground text-sm">
										Password
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground transition-colors duration-200" />
											<Input
												type={isPasswordVisible ? "text" : "password"}
												placeholder="Enter your password"
												{...field}
												className="border-border bg-background pr-12 pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
											/>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => setIsPasswordVisible((prev) => !prev)}
												className="-translate-y-1/2 absolute top-1/2 right-1 h-8 w-8 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
											>
												{isPasswordVisible ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</Button>
										</div>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						<div className="flex items-center justify-between space-x-2">
							<div className="flex items-center space-x-2">
								{/** biome-ignore lint/correctness/useUniqueElementIds: <static id required here> */}
								<Checkbox
									id="remember"
									checked={rememberMe}
									onCheckedChange={(checked) => setRememberMe(checked === true)}
									className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
								/>
								<label
									htmlFor="remember"
									className="cursor-pointer text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground"
								>
									Remember me
								</label>
							</div>
							<Button
								variant="link"
								size="sm"
								className="h-auto p-0 text-primary text-sm hover:text-primary/80"
								type="button"
							>
								Forgot password?
							</Button>
						</div>

						<Button
							type="submit"
							className="group w-full bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
							disabled={form.formState.isSubmitting}
							size="lg"
						>
							{form.formState.isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing in...
								</>
							) : (
								<>
									Sign In
									<ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
								</>
							)}
						</Button>
					</form>
				</Form>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-border border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-card px-2 text-muted-foreground">
							New to our platform?
						</span>
					</div>
				</div>

				<Button
					variant="outline"
					className="w-full border-border bg-background text-foreground transition-all duration-300 hover:bg-muted hover:shadow-md"
					size="lg"
					type="button"
				>
					Create Account
				</Button>

				<p className="text-center text-muted-foreground text-xs leading-relaxed">
					By signing in, you agree to our{" "}
					<Button variant="link" className="h-auto p-0 text-primary text-xs">
						Terms of Service
					</Button>{" "}
					and{" "}
					<Button variant="link" className="h-auto p-0 text-primary text-xs">
						Privacy Policy
					</Button>
				</p>
			</CardContent>
		</Card>
	);
}
