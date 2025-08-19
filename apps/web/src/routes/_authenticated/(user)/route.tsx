import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { UserNavbar } from "@/components/user/shared/navbar";

export const Route = createFileRoute("/_authenticated/(user)")({
	component: UserLayout,
});

function UserLayout() {
	return (
		<>
			<Suspense>
				<UserNavbar />
			</Suspense>

			<Outlet />
		</>
	);
}
