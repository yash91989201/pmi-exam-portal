import { createFileRoute, Link } from "@tanstack/react-router";
import { SignUpForm } from "@/components/admin/auth/sign-up-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/auth/admin/sign-up")({
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
						<Button asChild variant="secondary">
							<Link to="/auth/admin/sign-in">Go to Sign In</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<SignUpForm />
		</div>
	);
}
