import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import z from "zod";
import {
	UpdateExamsAssignmentTable,
	UpdateExamsAssignmentTableSkeleton,
} from "@/components/admin/user/update-exams-assignment-table";
import { queryUtils } from "@/utils/orpc";

const RouteSearchSchema = z.object({
	exam: z.string().optional(),
	status: z.enum(["all", "assigned", "unassigned"]).default("all").optional(),
	cursor: z.string().optional(),
	limit: z.number().default(10).catch(10),
});

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/$userId/manage-exams-assignment",
)({
	validateSearch: RouteSearchSchema,
	loader: async ({
		context: { queryClient },
		params: { userId },
		location,
	}) => {
		const { exam, status, cursor, limit } = location.search as z.infer<
			typeof RouteSearchSchema
		>;

		await queryClient.prefetchQuery(
			queryUtils.admin.getExamsAssignedStatus.queryOptions({
				input: {
					userId,
					query: { exam },
					filter: { status },
					cursor,
					limit,
				},
			}),
		);
	},
	pendingComponent: () => <UpdateExamsAssignmentTableSkeleton />,
	component: RouteComponent,
});

function RouteComponent() {
	const { userId } = Route.useParams();
	const { exam, status, cursor, limit } = Route.useSearch();

	const { data } = useSuspenseQuery(
		queryUtils.admin.getExamsAssignedStatus.queryOptions({
			input: {
				userId,
				query: { exam },
				filter: { status },
				cursor,
				limit,
			},
		}),
	);

	return (
		<Suspense fallback={<UpdateExamsAssignmentTableSkeleton />}>
			<UpdateExamsAssignmentTable
				userId={userId}
				examsAssignedStatus={data.examsAssignedStatus}
				nextCursor={data.nextCursor}
			/>
		</Suspense>
	);
}
