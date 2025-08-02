import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ context, location }) => {
		const session = context.session;

		if (!session) {
			if (location.pathname.startsWith("/_authenticated/admin")) {
				throw redirect({
					to: "/auth/admin/login",
				});
			}
			throw redirect({
				to: "/",
			});
		}

		const isAdmin = session.user.role === "admin";

		if (isAdmin && location.pathname.startsWith("/user")) {
			throw redirect({
				to: "/admin",
			});
		}

		if (!isAdmin && location.pathname.startsWith("/admin")) {
			throw redirect({
				to: "/user",
			});
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
