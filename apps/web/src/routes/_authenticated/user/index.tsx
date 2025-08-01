import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/user/")({
	beforeLoad: async ({ context }) => {
		const session = context.session;

		console.log(session);
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_authenticated/user/"!</div>;
}
