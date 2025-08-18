import { createFileRoute } from "@tanstack/react-router";
import {
	UserExamsTable,
	UserExamsTableSkeleton,
} from "@/components/admin/user/user-exams-table";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/$userId/",
)({
	component: RouteComponent,
	pendingComponent: () => <UserExamsTableSkeleton />,
});

function RouteComponent() {
	const userId = Route.useParams().userId;
	return <UserExamsTable userId={userId} />;
}
