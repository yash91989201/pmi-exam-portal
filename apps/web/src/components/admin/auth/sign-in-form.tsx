import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, Loader2, Mail, KeyRound } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { AdminSignInSchema } from "@/lib/schema";
import type { AdminSignInSchemaType } from "@/lib/types";

export const AdminSignInForm = () => {
	const router = useRouter();

	const form = useForm<AdminSignInSchemaType>({
		resolver: standardSchemaResolver(AdminSignInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const { mutateAsync: signInWithEmailPassword, isPending } = useMutation({
		mutationKey: ["sign-in", "email-password"],
		mutationFn: async ({ email, password }: AdminSignInSchemaType) => {
			const emailPasswordSignInRes = await authClient.signIn.email({
				email,
				password,
			});

			if (emailPasswordSignInRes.error) {
				throw new Error(emailPasswordSignInRes.error.message);
			}

			return emailPasswordSignInRes;
		},
		onSuccess: () => {
			toast.success("Signed in successfully");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const onSubmit: SubmitHandler<AdminSignInSchemaType> = async (formData) => {
		try {
			await signInWithEmailPassword(formData);

			router.navigate({
				to: "/dashboard",
			});
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "SignIn failed, try again.",
			);
		}
	};

	return (
		<div className="mx-auto grid w-full max-w-sm gap-6">
			<div className="grid gap-2 text-center">
				<h1 className="text-3xl font-bold">Admin Sign In</h1>
				<p className="text-balance text-muted-foreground">
					Sign in to your admin account to manage the exam portal
				</p>
			</div>
			<Form {...form}>
				<form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email Address</FormLabel>
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
								<FormLabel>Password</FormLabel>
								<FormControl>
									<div className="relative">
										<KeyRound className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Enter your password"
											type="password"
											{...field}
											className="pl-10"
										/>
									</div>
								</FormControl>
								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>

					<Button
						className="group w-full"
						disabled={isPending}
						size="lg"
					>
						{isPending ? (
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

			<div className="mt-4 text-center text-sm">
				Donot have an admin account?{" "}
				<Link
					to="/auth/admin/sign-up"
					className={buttonVariants({
						variant: "link",
						className: "underline",
					})}
				>
					Sign Up
				</Link>
			</div>
		</div>
	);
};
