import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
	ArrowRight,
	Eye,
	EyeOff,
	Loader2,
	Lock,
	Mail,
	RectangleEllipsis,
} from "lucide-react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { AdminSignupSchema } from "@/lib/schema";
import type { AdminSignupSchemaType } from "@/lib/types";
import { queryUtils } from "@/utils/orpc";

export const SignUpForm = () => {
	const router = useRouter();
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState(false);

	const form = useForm<AdminSignupSchemaType>({
		resolver: zodResolver(AdminSignupSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			formState: {
				otpSent: false,
			},
		},
	});

	const { mutateAsync: createAdmin } = useMutation(
		queryUtils.admin.createAdmin.mutationOptions({}),
	);

	const {
		mutateAsync: sendVerificationOtp,
		isPending: isSendingVerificationOtp,
	} = useMutation({
		mutationKey: ["send-verification-otp"],
		mutationFn: async ({ email }: { email: string }) => {
			const sendVerificationOtpRes =
				await authClient.emailOtp.sendVerificationOtp({
					email,
					type: "email-verification",
				});

			if (sendVerificationOtpRes.error) {
				throw new Error(sendVerificationOtpRes.error.message);
			}

			return sendVerificationOtpRes;
		},
		onSuccess: ({ data }) => {
			if (!data.success) return;
			toast.success("OTP sent to your email");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const { mutateAsync: verifyEmail } = useMutation(
		queryUtils.admin.verifyEmail.mutationOptions({}),
	);

	const { mutateAsync: signUpWithEmail } = useMutation({
		mutationKey: ["sign-up", "email"],
		mutationFn: async (formData: Omit<AdminSignupSchemaType, "formState">) => {
			const signUpRes = await authClient.signUp.email({
				...formData,
				name: formData.email.split("@")[0] ?? "",
			});

			if (signUpRes.error) {
				throw new Error(signUpRes.error.message);
			}

			return signUpRes;
		},
		onSuccess: () => {
			toast.success("Signed up successfully");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleSendOtp = async () => {
		const isSignUpInputValid = await Promise.all([
			form.trigger("email"),
			form.trigger("password"),
			form.trigger("confirmPassword"),
		]).then((res) => res.every((isValid) => isValid));

		if (!isSignUpInputValid) return;

		const email = form.getValues("email");

		const { data } = await sendVerificationOtp({ email });

		form.setValue("formState", {
			otpSent: data.success,
		});
	};

	const onSubmit: SubmitHandler<AdminSignupSchemaType> = async ({
		formState: _,
		...formData
	}) => {
		try {
			const verifyEmailRes = await verifyEmail({
				email: formData.email,
				otp: formData.otp,
			});

			if (!verifyEmailRes.success) {
				throw new Error(verifyEmailRes.message);
			}

			const signUpWithEmailRes = await signUpWithEmail(formData);

			const createAdminRes = await createAdmin({
				userId: signUpWithEmailRes.data.user.id,
			});

			if (!createAdminRes.success) {
				throw new Error(createAdminRes.message);
			}

			toast.success(createAdminRes.message);

			router.navigate({ to: "/dashboard" });
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to create admin account. Please try again.",
			);
		}
	};

	const otpSent = form.watch("formState.otpSent");

	return (
		<Card className="mx-auto w-full max-w-lg border-border bg-card shadow-lg transition-all duration-300 hover:shadow-primary/10 hover:shadow-xl">
			<CardHeader className="space-y-1 text-center">
				<div className="mx-auto mb-6 w-fit">
					<img src="/pmi_logo.webp" alt="PMI Logo" className="h-16 w-auto" />
				</div>
				<CardTitle className="font-bold text-2xl text-card-foreground">
					Admin Sign Up
				</CardTitle>
				<CardDescription className="text-muted-foreground">
					Create an admin account to manage the exam portal
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
												placeholder="Enter your password"
												type={isPasswordVisible ? "text" : "password"}
												{...field}
												className="border-border bg-background pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
											/>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => setIsPasswordVisible((prev) => !prev)}
												className="-translate-y-1/2 absolute top-1/2 right-1 h-8 w-8 text-muted-foreground transition-colors hover:text-foreground"
											>
												{isPasswordVisible ? (
													<EyeOff size={16} />
												) : (
													<Eye size={16} />
												)}
											</Button>
										</div>
									</FormControl>
									<FormDescription>
										Password must be at least 8 characters long.
									</FormDescription>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-medium text-foreground text-sm">
										Confirm Password
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground transition-colors duration-200" />
											<Input
												placeholder="Confirm your password"
												type={isConfirmPasswordVisible ? "text" : "password"}
												{...field}
												className="border-border bg-background pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
											/>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() =>
													setIsConfirmPasswordVisible((prev) => !prev)
												}
												className="-translate-y-1/2 absolute top-1/2 right-1 h-8 w-8 text-muted-foreground transition-colors hover:text-foreground"
											>
												{isConfirmPasswordVisible ? (
													<EyeOff size={16} />
												) : (
													<Eye size={16} />
												)}
											</Button>
										</div>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{otpSent && (
							<FormField
								control={form.control}
								name="otp"
								render={({ field }) => (
									<FormItem>
										<FormLabel>One-Time Password</FormLabel>
										<FormControl>
											<InputOTP
												maxLength={6}
												pattern={REGEXP_ONLY_DIGITS}
												{...field}
											>
												<InputOTPGroup>
													<InputOTPSlot index={0} />
													<InputOTPSlot index={1} />
													<InputOTPSlot index={2} />
												</InputOTPGroup>
												<InputOTPSeparator />
												<InputOTPGroup>
													<InputOTPSlot index={3} />
													<InputOTPSlot index={4} />
													<InputOTPSlot index={5} />
												</InputOTPGroup>
											</InputOTP>
										</FormControl>
										<FormDescription>
											Please enter the one-time password sent to your email.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{otpSent ? (
							<Button
								className="group w-full bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
								disabled={form.formState.isSubmitting}
								size="lg"
							>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Signing up...
									</>
								) : (
									<>
										Sign Up
										<ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
									</>
								)}
							</Button>
						) : (
							<Button
								type="button"
								className="group w-full bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
								disabled={form.formState.isSubmitting}
								size="lg"
								onClick={handleSendOtp}
							>
								{isSendingVerificationOtp ? (
									<Loader2 className="mr-3 size-4.5 animate-spin" />
								) : (
									<RectangleEllipsis className="mr-1. size-4.5" />
								)}
								<span>Send OTP</span>
							</Button>
						)}
					</form>
				</Form>

				<p className="mx-auto w-fit gap-1.5 text-sm">
					Already have an account?
					<Link
						to="/auth/admin/sign-in"
						className={buttonVariants({
							variant: "link",
							className:
								"inline w-auto px-0 font-medium text-primary underline decoration-primary/70 underline-offset-4 transition-colors hover:text-primary/90 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-primary",
						})}
						aria-label="Sign in to your admin account"
					>
						Sign In
					</Link>
					instead
				</p>

				<p className="text-center text-muted-foreground text-xs leading-relaxed">
					By creating an account, you agree to our{" "}
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
};
