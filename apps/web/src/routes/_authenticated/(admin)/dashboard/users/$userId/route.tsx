import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import {
	UserManagementNavbar,
	UserManagementNavbarSkeleton,
} from "@/components/admin/shared/user-management-navbar";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/$userId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const userId = Route.useParams().userId;

	return (
		<div className="space-y-6">
			<Suspense fallback={<UserManagementNavbarSkeleton />}>
				<UserManagementNavbar userId={userId} />
			</Suspense>

			<Separator />

			<Outlet />
		</div>
	);
}
