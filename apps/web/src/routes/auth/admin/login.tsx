import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginForm } from "@/components/admin/auth/login-form";

export const Route = createFileRoute("/auth/admin/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<AdminLoginForm />
		</div>
	);
}
