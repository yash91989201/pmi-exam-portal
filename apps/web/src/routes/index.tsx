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

function HomeComponent() {
	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">user login</div>
	);
}
