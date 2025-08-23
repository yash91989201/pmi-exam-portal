import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import {
	UserOrders,
	UserOrdersSkeleton,
} from "@/components/shared/user-orders";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/(user)/orders")({
	loader: async ({ context: { queryUtils, queryClient } }) => {
		queryClient.prefetchQuery(queryUtils.user.listOrders.queryOptions({}));
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto py-4 md:py-6">
			<Card>
				<CardHeader>
					<CardTitle>Order Status</CardTitle>
					<CardDescription>
						Track the status of your order in real-time.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<UserOrdersSkeleton />}>
						<UserOrders />
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}
