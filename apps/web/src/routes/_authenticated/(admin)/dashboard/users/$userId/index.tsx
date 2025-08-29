import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import {
	UserExamsTable,
	UserExamsTableSkeleton,
} from "@/components/admin/user/user-exams-table";
import {
	UserExamsStats,
	UserExamsStatsSkeleton,
} from "@/components/admin/users/user-exams-stats";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/$userId/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { userId } = Route.useParams();
	return (
		<>
			<Suspense fallback={<UserExamsStatsSkeleton />}>
				<UserExamsStats userId={userId} />
			</Suspense>

			<Suspense fallback={<UserExamsTableSkeleton />}>
				<UserExamsTable userId={userId} />
			</Suspense>
		</>
	);
}
