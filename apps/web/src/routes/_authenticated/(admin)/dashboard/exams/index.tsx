import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import z from "zod";
import {
	ExamsTable,
	ExamsTableSkeleton,
} from "@/components/admin/exams/exams-table";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const RouteSearchSchema = z.object({
	page: z.number().min(1).default(1).catch(1),
	limit: z.number().min(1).max(20).default(10).catch(10),
});

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/exams/",
)({
	validateSearch: RouteSearchSchema,
	beforeLoad: async ({ context: { queryClient, queryUtils }, search }) => {
		queryClient.ensureQueryData(
			queryUtils.admin.listExams.queryOptions({
				input: search,
			}),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { limit, page } = Route.useSearch();

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle className="mb-1 font-bold text-3xl tracking-tight">
							Manage Exams
						</CardTitle>
						<CardDescription className="max-w-lg">
							Create and manage PMI certification exams.
						</CardDescription>
					</div>
					<Button asChild>
						<Link to="/dashboard/exams/create-exam">
							<Plus className="mr-1 size-4" />
							<span>Create New Exam</span>
						</Link>
					</Button>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<ExamsTableSkeleton />}>
						<ExamsTable limit={limit} page={page} />
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}
