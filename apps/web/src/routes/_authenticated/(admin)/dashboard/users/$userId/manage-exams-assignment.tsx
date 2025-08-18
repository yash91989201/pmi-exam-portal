import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UpdateExamsAssignmentForm } from "@/components/admin/user/update-exams-assignment-form";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/$userId/manage-exams-assignment",
)({
	loader: async ({
		context: { queryUtils, queryClient },
		params: { userId },
	}) => {
		queryClient.prefetchQuery(
			queryUtils.exam.getExamsAssignedStatus.queryOptions({
				input: { userId },
			}),
		)
	},
	component: RouteComponent,
});

function RouteComponent() {
	const userId = Route.useParams().userId;
	const {
		data: { examsAssignedStatus },
	} = useSuspenseQuery(
		queryUtils.exam.getExamsAssignedStatus.queryOptions({ input: { userId } }),
	)
	return (
		<div>
			<UpdateExamsAssignmentForm
				userId={userId}
				examsAssignedStatus={examsAssignedStatus}
			/>
		</div>
	)
}
