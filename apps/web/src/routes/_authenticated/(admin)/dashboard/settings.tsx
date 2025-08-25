import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { GetPortalSettingsOutputType } from "@server-types/setting";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
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
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { PortalSettingsFormSchema } from "@/lib/schema/setting";
import type { PortalSettingsFormSchemaType } from "@/lib/types/setting";
import { orpcClient, queryUtils } from "@/utils/orpc";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/settings",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: settingsData } = useSuspenseQuery<GetPortalSettingsOutputType>(
		queryUtils.admin.getPortalSettings.queryOptions(),
	);

	const form = useForm<PortalSettingsFormSchemaType>({
		resolver: standardSchemaResolver(PortalSettingsFormSchema),
		defaultValues: {
			enableRegistration: settingsData?.data?.enableRegistration ?? false,
			emailVerificationRequired:
				settingsData?.data?.emailVerificationRequired ?? false,
			enableExamMonitoring: settingsData?.data?.enableExamMonitoring ?? false,
		},
	});

	const { mutate: updateSettings, isPending } = useMutation({
		mutationFn: (values: PortalSettingsFormSchemaType) =>
			orpcClient.admin.updatePortalSettings(values),
		onSuccess: () => {
			toast.success("Portal settings updated successfully!");
			// queryClient.invalidateQueries({
			// 	queryKey: queryUtils.admin.getPortalSettings.queryKey,
			// });
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update settings.");
		},
	});

	const onSubmit = (values: PortalSettingsFormSchemaType) => {
		updateSettings(values);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Portal Settings</CardTitle>
				<CardDescription>
					Manage general settings for the exam portal.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="enableRegistration"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="text-base">
											Enable User Registration
										</FormLabel>
										<FormDescription>
											Allow new users to register for an account.
										</FormDescription>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="emailVerificationRequired"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="text-base">
											Require Email Verification
										</FormLabel>
										<FormDescription>
											Force users to verify their email address before they can
											log in.
										</FormDescription>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="enableExamMonitoring"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="text-base">
											Require Email Verification
										</FormLabel>
										<FormDescription>
											Force users to verify their email address before they can
											log in.
										</FormDescription>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Saving..." : "Save Changes"}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
