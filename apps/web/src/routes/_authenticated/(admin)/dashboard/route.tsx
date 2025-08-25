import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminNavbar } from "@/components/admin/shared/navbar";

export const Route = createFileRoute("/_authenticated/(admin)/dashboard")({
	component: AdminLayout,
});

function AdminLayout() {
	return (
		<>
			<AdminNavbar />
			<main className="container mx-auto py-8">
				<Outlet />
			</main>
		</>
	);
}
