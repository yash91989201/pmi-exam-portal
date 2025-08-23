import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
			});

			toast.success("Logged in successfully!");
			router.navigate({ to: "/exams" });
		} catch (error) {
			console.error(error);
			toast.error("Failed to login. Please check your credentials.");
		}
	};

	return (
		<div className="space-y-6">
			<Form {...form}>
				<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<div className="relative">
										<Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="name@example.com"
											{...field}
											className="pl-10"
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between">
									<FormLabel>Password</FormLabel>
								</div>
								<FormControl>
									<div className="relative">
										<Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
										<Input
											type={isPasswordVisible ? "text" : "password"}
											placeholder="••••••••"
											{...field}
											className="pl-10"
										/>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => setIsPasswordVisible((prev) => !prev)}
											className="-translate-y-1/2 absolute top-1/2 right-1 h-8 w-8 text-muted-foreground transition-colors hover:text-foreground"
										>
											{isPasswordVisible ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</Button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						type="submit"
						className="w-full"
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							"Log in"
						)}
					</Button>
				</form>
			</Form>
		</div>
	);
}
