import { createFileRoute } from "@tanstack/react-router";
import { AdminSignInForm } from "@/components/admin/auth/sign-in-form";

export const Route = createFileRoute("/auth/admin/sign-in")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<AdminSignInForm />
		</div>
	);
}
