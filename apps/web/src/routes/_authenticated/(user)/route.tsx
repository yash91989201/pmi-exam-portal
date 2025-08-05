import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/(user)")({
	component: UserLayout,
});

function UserLayout() {
	return <Outlet />;
}
