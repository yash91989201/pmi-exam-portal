import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowRight, Loader2, Mail, RectangleEllipsis } from "lucide-react";
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
import { AdminSignInSchema } from "@/lib/schema";
import type { AdminSignInSchemaType } from "@/lib/types";
import { queryUtils } from "@/utils/orpc";

export const AdminSignInForm = () => {
	const router = useRouter();

	const form = useForm<AdminSignInSchemaType>({
		resolver: standardSchemaResolver(AdminSignInSchema),
		defaultValues: {
			email: "",
			otp: "",
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

	const { mutateAsync: signInWithEmailOtp } = useMutation({
		mutationKey: ["sign-in", "email-otp"],
		mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
			const emailOtpSignInRes = await authClient.signIn.emailOtp({
				email,
				otp,
			});

			if (emailOtpSignInRes.error) {
				throw new Error(emailOtpSignInRes.error.message);
			}

			return emailOtpSignInRes;
		},
		onSuccess: () => {
			toast.success("Signed in successfully");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleSendOtp = async () => {
		const emailValid = await form.trigger("email");
		if (!emailValid) return;

		const email = form.getValues("email");

		const { data } = await sendVerificationOtp({ email });

		form.setValue("formState", {
			otpSent: data.success,
		});
	};

	const onSubmit: SubmitHandler<AdminSignInSchemaType> = async ({
		formState: _,
		...formData
	}) => {
		try {
			const {
				data: { user },
			} = await signInWithEmailOtp({
				email: formData.email,
				otp: formData.otp,
			});

			const createAdminRes = await createAdmin({
				userId: user.id,
			});

			if (!createAdminRes.success) {
				throw new Error(createAdminRes.message);
			}

			toast.success(createAdminRes.message);

			router.navigate({
				to: "/dashboard",
			});
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "SignIn failed, try again.",
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
					Admin Sign In
				</CardTitle>
				<CardDescription className="text-muted-foreground">
					Sign in to your admin account to manage the exam portal
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
												disabled={field.disabled || otpSent}
												className="border-border bg-background pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
											/>
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
											Please enter the one-time password sent to your phone.
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
										Signing in...
									</>
								) : (
									<>
										Sign In
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
					Donot have an admin account?
					<Link
						to="/auth/admin/sign-up"
						className={buttonVariants({
							variant: "link",
							className:
								"inline w-auto px-0 font-medium text-primary underline decoration-primary/70 underline-offset-4 transition-colors hover:text-primary/90 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-primary",
						})}
						aria-label="Sign in to your admin account"
					>
						Sign Up
					</Link>
					here
				</p>

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
};
