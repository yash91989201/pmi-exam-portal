import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { type SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
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

export const CreateUserFormSchema = z.object({
	email: z.email(),
	password: z.string().min(8, "Password must be at least 8 characters long"),
	name: z.string().min(3, "Username must be at least 3 characters long"),
});

export type CreateUserFormType = z.infer<typeof CreateUserFormSchema>;

export const CreateUserForm = () => {
	const form = useForm({
		resolver: standardSchemaResolver(CreateUserFormSchema),
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
	});

	const onSubmit: SubmitHandler<CreateUserFormType> = async (formData) => {
		const createUserRes = await authClient.admin.createUser(formData);

		if (createUserRes.error) {
			console.error("Error creating user:", createUserRes.error);
			return;
		}

		form.reset();
		console.log(createUserRes.data.user);
	};

	return (
		<div className="mx-auto max-w-md space-y-6">
			<div>
				<h2 className="font-bold text-2xl text-gray-900 dark:text-gray-100">
					Create New User
				</h2>
				<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
					Fill in the details to create a new user account.
				</p>
			</div>

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

					<Button
						type="submit"
						className="mt-6 w-full"
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting ? "Creating User..." : "Create User"}
					</Button>
				</form>
			</Form>
		</div>
	);
};
