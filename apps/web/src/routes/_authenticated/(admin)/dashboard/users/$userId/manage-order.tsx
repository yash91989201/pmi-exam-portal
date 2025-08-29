import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import {
	ManageOrdersForm,
	ManageOrdersFormSkeleton,
} from "@/components/admin/user/manage-orders-form";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/$userId/manage-order",
)({
	loader: async ({ context: { queryClient, queryUtils }, params }) => {
		queryClient.prefetchQuery(
			queryUtils.admin.getUserOrders.queryOptions({
				input: { userId: params.userId },
			}),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { userId } = Route.useParams();

	return (
		<Suspense fallback={<ManageOrdersFormSkeleton />}>
			<ManageOrdersForm userId={userId} />
		</Suspense>
	);
}
