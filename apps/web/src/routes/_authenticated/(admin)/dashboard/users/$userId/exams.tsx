import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UpdateExamsAssignmentForm } from "@/components/admin/user/manage-user-exams";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/$userId/exams",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const userId = Route.useParams().userId;
	const { data } = useSuspenseQuery(
		queryUtils.exam.getExamsAssignedStatus.queryOptions({
			input: { userId },
		}),
	);

	return (
		<div>
			<UpdateExamsAssignmentForm
				userId={userId}
				examsAssignedStatus={data.examsAssignedStatus}
			/>
		</div>
	);
}
