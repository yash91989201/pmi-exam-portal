import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Suspense } from "react";
import z from "zod";
import {
	UpdateExamsAssignmentTable,
	UpdateExamsAssignmentTableSkeleton,
} from "@/components/admin/user/update-exams-assignment-table";
import { queryUtils } from "@/utils/orpc";

const RouteSearchSchema = z.object({
	exam: z.string().optional(),
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
		const { exam } = location.search as z.infer<typeof RouteSearchSchema>;
		await queryClient.prefetchQuery(
			queryUtils.admin.getExamsAssignedStatus.queryOptions({
				input: { userId, query: { exam } },
			}),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { userId } = Route.useParams();
	const { exam } = Route.useSearch();
	const router = useRouter();

	const { data } = useSuspenseQuery(
		queryUtils.admin.getExamsAssignedStatus.queryOptions({
			input: { userId, query: { exam } },
		}),
	);

	return (
		<Suspense fallback={<UpdateExamsAssignmentTableSkeleton />}>
			<UpdateExamsAssignmentTable
				userId={userId}
				searchQuery={exam}
				examsAssignedStatus={data.examsAssignedStatus}
				onSearchQueryChange={(exam) =>
					router.navigate({
						to: "/dashboard/users/$userId/manage-exams-assignment",
						params: { userId },
						search: {
							exam,
						},
						replace: true,
					})
				}
			/>
		</Suspense>
	);
}
