import { createFileRoute, Outlet } from "@tanstack/react-router";
import { UserNavbar } from "@/components/user/shared/navbar";

export const Route = createFileRoute("/_authenticated/(user)")({
	component: UserLayout,
});

function UserLayout() {
	return (
		<>
			<UserNavbar />

			<main className="container mx-auto py-6">
				<Outlet />
			</main>
		</>
	);
}
