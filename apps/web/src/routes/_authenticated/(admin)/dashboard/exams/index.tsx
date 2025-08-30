import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import z from "zod";
import {
	ExamsTable,
	ExamsTableSkeleton,
} from "@/components/admin/exams/exams-table";
import { buttonVariants } from "@/components/ui/button";

export const RouteSearchSchema = z.object({
	page: z.number().min(1).default(1).catch(1),
	limit: z.number().min(1).max(20).default(10).catch(10),
	certification: z.string().optional(),
});

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/exams/",
)({
	validateSearch: RouteSearchSchema,
	beforeLoad: async ({ context: { queryClient, queryUtils }, search }) => {
		const { limit, page, certification } = search;
		queryClient.ensureQueryData(
			queryUtils.admin.listExams.queryOptions({
				input: {
					limit,
					page,
					filter: {
						certification,
					},
				},
			}),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="space-y-6">
			<section className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-3xl tracking-tight">Manage Exams</h2>
					<p className="">Create and manage PMI certification exams.</p>
				</div>
				<Link to="/dashboard/exams/create-exam" className={buttonVariants()}>
					<Plus className="mr-1 size-4" />
					<span>Create New Exam</span>
				</Link>
			</section>
			<Suspense fallback={<ExamsTableSkeleton />}>
				<ExamsTable />
			</Suspense>
		</div>
	);
}
