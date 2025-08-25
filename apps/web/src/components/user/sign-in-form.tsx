import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ArrowRight, Loader2, Mail, KeyRound } from "lucide-react";
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
import { UserSignInSchema } from "@/lib/schema";
import type { UserSignInSchemaType } from "@/lib/types";

export const UserSignInForm = () => {
	const router = useRouter();

	const form = useForm<UserSignInSchemaType>({
		resolver: standardSchemaResolver(UserSignInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const { mutateAsync: signInWithEmailPassword, isPending } = useMutation({
		mutationKey: ["sign-in", "email-password"],
		mutationFn: async ({ email, password }: UserSignInSchemaType) => {
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

	const onSubmit: SubmitHandler<UserSignInSchemaType> = async (formData) => {
		try {
			await signInWithEmailPassword(formData);

			router.navigate({
				to: "/exams",
			});
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "SignIn failed, try again.",
			);
		}
	};

	return (
		<Card className="mx-auto w-full max-w-lg border-border bg-card shadow-lg transition-all duration-300 hover:shadow-primary/10 hover:shadow-xl">
			<CardHeader className="space-y-1 text-center">
				<CardTitle className="font-bold text-2xl text-card-foreground">
					Sign In
				</CardTitle>
				<CardDescription className="text-muted-foreground">
					Sign in to your account to access your exams and certifications.
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
							className="group w-full bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
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
