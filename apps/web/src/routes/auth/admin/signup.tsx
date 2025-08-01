import { createFileRoute, Link } from "@tanstack/react-router";
import { SignUpForm } from "@/components/admin/signup-form";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/auth/admin/signup")({
	loader: async ({ context }) => {
		const result = await context.orpcClient.adminSetting.registrationEnabled();
		if (!result.success || !result.data?.enabled) {
			return {
				registrationAllowed: false,
				error: result.message || "Admin registration is currently disabled.",
			};
		}
		return { registrationAllowed: true };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { registrationAllowed, error } = Route.useLoaderData();

	if (!registrationAllowed) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Card className="mx-auto w-full max-w-md">
					<CardHeader>
						<CardTitle>Registration Disabled</CardTitle>
						<CardDescription>{error}</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild variant="secondary">
							<a href="/auth/admin/login">Go to Login</a>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="mx-auto w-xl">
				<CardHeader>
					<CardTitle>Create an admin account</CardTitle>
					<CardDescription>
						Enter your information below to create your admin account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SignUpForm />
				</CardContent>
				<CardFooter>
					<div className="w-full text-center text-muted-foreground text-sm">
						Already have an account?
						<Link
							to="/auth/admin/login"
							className={buttonVariants({ variant: "link" })}
						>
							LogIn
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
