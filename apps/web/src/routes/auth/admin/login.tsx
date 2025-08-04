import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLoginForm } from "@/components/admin/auth/login-form";
import { buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/auth/admin/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="mx-auto w-xl">
				<CardHeader>
					<CardTitle>Admin Login</CardTitle>
					<CardDescription>
						Enter your credentials to login as an admin
					</CardDescription>
				</CardHeader>
				<CardContent>
					<AdminLoginForm />
				</CardContent>
				<CardFooter>
					<div className="w-full text-center text-muted-foreground text-sm">
						Don't have an admin account?
						<Link
							to="/auth/admin/signup"
							className={buttonVariants({ variant: "link" })}
						>
							Sign Up
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
