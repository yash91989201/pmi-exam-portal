import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: async ({ context }) => {
		const session = context.session;

		if (!session) {
			return;
		}

		throw redirect({
			to: session.user.role === "admin" ? "/dashboard" : "/exams",
		});
	},
	component: HomeComponent,
});

import { UserLoginForm } from "@/components/user/login-form";

function HomeComponent() {
	return (
		<div className="container mx-auto max-w-sm px-4 py-8">
			<h1 className="mb-4 text-center text-2xl font-bold">User Login</h1>
			<UserLoginForm />
		</div>
	);
}
