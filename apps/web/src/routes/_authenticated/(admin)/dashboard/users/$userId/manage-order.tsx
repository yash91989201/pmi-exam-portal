import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import {
	ManageOrdersForm,
	ManageOrdersFormSkeleton,
} from "@/components/admin/user/manage-orders-form";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/$userId/manage-order",
)({ component: RouteComponent });

function RouteComponent() {
	const { userId } = Route.useParams();

	return (
		<div className="container mx-auto py-4 md:py-6">
			<Suspense fallback={<ManageOrdersFormSkeleton />}>
				<ManageOrdersForm userId={userId} />
			</Suspense>
		</div>
	);
}
