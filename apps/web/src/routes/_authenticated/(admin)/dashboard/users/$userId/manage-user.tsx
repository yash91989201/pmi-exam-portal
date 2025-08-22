import { createFileRoute } from "@tanstack/react-router";
import { ImpersonateUserBtn } from "@/components/admin/user/impersonate-user-btn";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/$userId/manage-user",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const userId = Route.useParams().userId;

	return (
		<div>
			<ImpersonateUserBtn userId={userId} />
		</div>
	);
}
