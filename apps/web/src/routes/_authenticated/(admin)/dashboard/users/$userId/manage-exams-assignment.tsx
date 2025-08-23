import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	UpdateExamsAssignmentForm,
	UpdateExamsAssignmentFormSkeleton,
} from "@/components/admin/user/update-exams-assignment-form";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/$userId/manage-exams-assignment",
)({
	loader: async ({
		context: { queryUtils, queryClient },
		params: { userId },
	}) => {
		queryClient.prefetchQuery(
			queryUtils.admin.getExamsAssignedStatus.queryOptions({
				input: { userId },
			}),
		);
	},
	component: RouteComponent,
	pendingComponent: () => <UpdateExamsAssignmentFormSkeleton />,
});

function RouteComponent() {
	const userId = Route.useParams().userId;
	const {
		data: { examsAssignedStatus },
	} = useSuspenseQuery(
		queryUtils.admin.getExamsAssignedStatus.queryOptions({ input: { userId } }),
	);
	return (
		<UpdateExamsAssignmentForm
			userId={userId}
			examsAssignedStatus={examsAssignedStatus}
		/>
	);
}
