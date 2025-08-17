import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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

export const CreateUserFormSchema = z.object({
	email: z.email("Please enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
	name: z.string().min(3, "Name must be at least 3 characters long"),
});

export type CreateUserFormType = z.infer<typeof CreateUserFormSchema>;

export const CreateUserForm = () => {
	const [openDialog, setOpenDialog] = useState(false);
	const form = useForm<CreateUserFormType>({
		resolver: standardSchemaResolver(CreateUserFormSchema),
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
	});

	const onSubmit: SubmitHandler<CreateUserFormType> = async (formData) => {
		try {
			const createUserRes = await authClient.admin.createUser(formData);

			if (createUserRes.error) {
				// Use form.setError for validation errors
				form.setError("root", {
					type: "manual",
					message: createUserRes.error.message,
				});
				return;
			}

			// Use toast for success messages
			toast.success(
				`User: ${createUserRes.data.user.name} created successfully`,
			);

			form.reset();
			setOpenDialog(false);
		} catch (error) {
			// Use form.setError for other errors
			form.setError("root", {
				type: "manual",
				message:
					error instanceof Error
						? error.message
						: "Failed to create user. Please try again.",
			});
		}
	};

	return (
		<Dialog open={openDialog} onOpenChange={setOpenDialog}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<UserPlus className="mr-2 size-4" />
					Create New User
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create New User</DialogTitle>
					<DialogDescription>
						Fill in the details below to create a new user account.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter full name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email Address</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="Enter email address"
											{...field}
										/>
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
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="Enter password (min 8 characters)"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Display root-level form errors */}
						{form.formState.errors.root && (
							<div className="text-destructive text-sm">
								{form.formState.errors.root.message}
							</div>
						)}

						<div className="flex justify-end gap-3 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpenDialog(false)}
								disabled={form.formState.isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? "Creating..." : "Create User"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
