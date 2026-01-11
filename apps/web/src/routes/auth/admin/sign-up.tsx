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
			registrationEnabled: true,
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
		<div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
			<div className="hidden bg-linear-to-br from-secondary to-chart-3 p-8 text-primary-foreground lg:flex lg:flex-col lg:items-center lg:justify-center">
				<div className="text-center">
					<img
						src="/pmi_logo.webp"
						alt="Logo"
						className="mx-auto mb-4 h-36 w-auto"
					/>
					<h1 className="font-bold text-4xl tracking-tight">
						Welcome to the PMI Authorized Exam Portal
					</h1>
					<p className="mt-4 text-lg">
						Manage exams, users, and results with ease.
					</p>
				</div>
			</div>
			<div className="flex items-center justify-center py-12">
				<SignUpForm />
			</div>
		</div>
	);
}
