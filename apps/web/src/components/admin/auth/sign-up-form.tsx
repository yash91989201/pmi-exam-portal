import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import {
	ArrowRight,
	Eye,
	EyeOff,
	Loader2,
	Lock,
	Mail,
} from "lucide-react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
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
		},
	});

	const { mutateAsync: createAdmin } = useMutation(
		queryUtils.admin.createAdmin.mutationOptions({}),
	);

	const { mutateAsync: signUpWithEmail } = useMutation({
		mutationKey: ["sign-up", "email"],
		mutationFn: async (formData: AdminSignupSchemaType) => {
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

	const onSubmit: SubmitHandler<AdminSignupSchemaType> = async (formData) => {
		try {
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

	return (
		<div className="mx-auto grid w-full max-w-sm gap-6">
			<div className="grid gap-2 text-center">
				<h1 className="font-bold text-3xl">Admin Sign Up</h1>
				<p className="text-balance text-muted-foreground">
					Create an admin account to manage the exam portal
				</p>
			</div>
			<Form {...form}>
				<form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
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
										<Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Enter your email"
											{...field}
											className="pl-10"
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
										<Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Enter your password"
											type={isPasswordVisible ? "text" : "password"}
											{...field}
											className="pl-10"
										/>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => setIsPasswordVisible((prev) => !prev)}
											className="-translate-y-1/2 absolute top-1/2 right-1 h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
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
										<Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Confirm your password"
											type={isConfirmPasswordVisible ? "text" : "password"}
											{...field}
											className="pl-10"
										/>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() =>
												setIsConfirmPasswordVisible((prev) => !prev)
											}
											className="-translate-y-1/2 absolute top-1/2 right-1 h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
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

					<Button
						className="group w-full"
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
				</form>
			</Form>

			<div className="mt-4 text-center text-sm">
				Already have an account?{" "}
				<Link
					to="/auth/admin/sign-in"
					className={buttonVariants({
						variant: "link",
						className: "underline",
					})}
				>
					Sign In
				</Link>
			</div>
		</div>
	);
};
