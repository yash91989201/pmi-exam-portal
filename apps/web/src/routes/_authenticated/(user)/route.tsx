import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { UserNabar } from "@/components/user/shared/navbar";

export const Route = createFileRoute("/_authenticated/(user)")({
	component: UserLayout,
});

function UserLayout() {
	return (
		<>
			<Suspense>
				<UserNabar />
			</Suspense>

			<Outlet />
		</>
	);
}
