import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Users } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { queryClient, queryUtils } from "@/utils/orpc";

export const BulkCreateUserFormSchema = z.object({
	emailsText: z.string().min(1, "Please enter at least one email address"),
});

export type BulkCreateUserFormType = z.infer<typeof BulkCreateUserFormSchema>;

export const BulkCreateUserForm = () => {
	const [open, setOpen] = useState(false);

	const form = useForm({
		resolver: standardSchemaResolver(BulkCreateUserFormSchema),
		defaultValues: {
			emailsText: "",
		},
	});

	const onSubmit: SubmitHandler<BulkCreateUserFormType> = async (formData) => {
		try {
			const emails = parseEmails(formData.emailsText);

			if (emails.length === 0) {
				form.setError("emailsText", {
					type: "manual",
					message: "Please enter at least one valid email address",
				});
				return;
			}

			const validationError = validateEmails(emails);
			if (validationError) {
				form.setError("emailsText", {
					type: "manual",
					message: validationError,
				});
				return;
			}

			const userData = emails.map((email) => ({
				email,
				name: extractNameFromEmail(email),
				password: "password",
			}));

			const results = await Promise.all(
				userData.map((user) => authClient.admin.createUser(user)),
			);

			// Check for errors in results
			const errors = results.filter((result) => result.error);
			const successes = results.filter((result) => !result.error);

			if (errors.length > 0) {
				const errorMessages = errors.map((result) => {
					const userIndex = results.indexOf(result);
					return `${userData[userIndex].email}: ${result.error?.message || "Unknown error"}`;
				});

				form.setError("emailsText", {
					type: "manual",
					message: `Failed to create ${errors.length} users:\n${errorMessages.join("\n")}`,
				});
			}

			if (successes.length > 0) {
				toast.success(
					`Successfully created ${successes.length} user${successes.length > 1 ? "s" : ""}`,
				);

				queryClient.refetchQueries(
					queryUtils.admin.listUsers.queryOptions({
						input: {},
					}),
				);

				if (errors.length === 0) {
					form.reset();
					setOpen(false);
				}
			}
		} catch (error) {
			form.setError("emailsText", {
				type: "manual",
				message:
					error instanceof Error
						? error.message
						: "An unexpected error occurred during bulk user creation",
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Users className="mr-2 size-4" />
					Bulk Create Users
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Bulk Create Users</DialogTitle>
					<DialogDescription>
						Enter email addresses separated by commas.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="emailsText"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email Addresses</FormLabel>
									<FormControl>
										<Textarea
											placeholder="john.doe@company.com, jane.smith@company.com"
											rows={6}
											{...field}
										/>
									</FormControl>
									<p className="text-muted-foreground text-xs">
										Names will be auto-generated from email addresses. Default
										password: "password"
									</p>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-3 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={form.formState.isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting
									? "Creating Users..."
									: "Create Users"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

const parseEmails = (emailsText: string): string[] => {
	return emailsText
		.split(",")
		.map((email) => email.trim())
		.filter((email) => email.length > 0);
};

const validateEmails = (emails: string[]): string | null => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const invalidEmails = emails.filter((email) => !emailRegex.test(email));

	if (invalidEmails.length > 0) {
		return `Invalid email addresses: ${invalidEmails.join(", ")}`;
	}

	return null;
};

const extractNameFromEmail = (email: string): string => {
	const namePart = email.split("@")[0];
	return namePart
		.replace(/[._-]/g, " ")
		.replace(/\b\w/g, (l) => l.toUpperCase());
};
