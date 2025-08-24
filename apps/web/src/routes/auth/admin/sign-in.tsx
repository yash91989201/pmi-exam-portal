import { createFileRoute } from "@tanstack/react-router";
import { AdminSignInForm } from "@/components/admin/auth/sign-in-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/auth/admin/sign-in")({
	loader: async ({ context: { orpcClient } }) => {
		const { message, data } = await orpcClient.admin.getRegistrationStatus();

		return {
			registrationEnabled: data?.registrationEnabled,
			error: message,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { registrationEnabled, error } = Route.useLoaderData();

	if (!registrationEnabled) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Card className="mx-auto w-full max-w-md">
					<CardHeader>
						<CardTitle>Registration Disabled</CardTitle>
						<CardDescription>{error}</CardDescription>
					</CardHeader>
					<CardContent>
						<p>
							Please contact the system administrator to enable admin
							registration.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<AdminSignInForm />
		</div>
	);
}
