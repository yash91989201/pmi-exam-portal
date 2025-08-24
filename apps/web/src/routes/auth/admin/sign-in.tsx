import { createFileRoute } from "@tanstack/react-router";
import { AdminSignInForm } from "@/components/admin/auth/sign-in-form";

export const Route = createFileRoute("/auth/admin/sign-in")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
			<div className="hidden bg-gradient-to-br from-secondary to-chart-3 p-8 text-primary-foreground lg:flex lg:flex-col lg:items-center lg:justify-center">
				<div className="text-center">
					<img
						src="/pmi_logo.webp"
						alt="PMI Logo"
						className="mx-auto mb-4 h-24 w-auto brightness-0 invert"
					/>
					<h1 className="font-bold text-4xl tracking-tight">
						Welcome back to the PMI Exam Portal
					</h1>
					<p className="mt-4 text-lg">
						Manage exams, users, and results with ease.
					</p>
				</div>
			</div>
			<div className="flex items-center justify-center py-12">
				<AdminSignInForm />
			</div>
		</div>
	);
}
