import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import CreateOrderForm from "@/components/admin/orders/create-order-form";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/orders",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { data } = useSuspenseQuery(queryUtils.admin.listOrders.queryOptions());

	return (
		<div className="flex flex-col gap-6">
			<h2 className="text-base md:text-3xl">Update Order Status</h2>
			<CreateOrderForm initialOrders={data} />
		</div>
	);
}
