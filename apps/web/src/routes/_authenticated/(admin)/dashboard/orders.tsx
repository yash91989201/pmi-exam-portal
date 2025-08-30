import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import CreateOrderForm from "@/components/admin/orders/create-order-form";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/orders",
)({
	component: RouteComponent,
	beforeLoad: async ({ context: { queryClient, queryUtils } }) => {
		await queryClient.ensureQueryData(
			queryUtils.admin.listOrders.queryOptions(),
		);
	},
});

function RouteComponent() {
	const { data } = useSuspenseQuery(queryUtils.admin.listOrders.queryOptions());

	return (
		<div className="space-y-6">
			<section>
				<div className="flex items-center justify-between">
					<div>
						<h2 className="font-bold text-3xl tracking-tight">
							Orders Management
						</h2>
						<p className="text-muted-foreground">
							Here you can create and manage user orders.
						</p>
					</div>
				</div>
			</section>
			<section>
				<CreateOrderForm initialOrders={data} />
			</section>
		</div>
	);
}

