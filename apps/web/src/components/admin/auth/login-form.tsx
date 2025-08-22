import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { AdminLoginSchema } from "@/lib/schema";
import type { AdminLoginSchemaType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AdminLoginForm() {
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
			router.navigate({ to: "/dashboard" });
		} catch (error) {
			console.error(error);
			toast.error("Failed to login. Please check your credentials.");
		}
	};

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-5"
				onSubmit={form.handleSubmit(onSubmit)}
			>
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
											autoComplete="current-password"
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
							</FormItem>
						)}
					/>
				</Card>

				{/* Submit */}
				<Button
					type="submit"
					className="mt-2 w-full transition-all"
					disabled={form.formState.isSubmitting}
				>
					{form.formState.isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Logging In...
						</>
					) : (
						"Login"
					)}
				</Button>
			</form>
		</Form>
	);
}
