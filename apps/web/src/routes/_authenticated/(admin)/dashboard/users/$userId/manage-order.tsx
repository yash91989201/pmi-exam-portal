import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ManageOrdersForm } from "@/components/admin/user/manage-orders-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/$userId/manage-order",
)({ component: RouteComponent });

function RouteComponent() {
	const { userId } = Route.useParams();

	return (
		<div className="container mx-auto py-4 md:py-6">
			<Card>
				<CardHeader>
					<CardTitle>Manage Orders</CardTitle>
					<CardDescription>
						Add, remove, reorder, and update the orders for this user.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<Skeleton className="h-64" />}>
						<ManageOrdersForm userId={userId} />
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}
