import type { UserExamResultType } from "@server-types/exam";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { queryUtils } from "@/utils/orpc";

export const ExamResultsTable = () => {
	const { data: examResults } = useSuspenseQuery(
		queryUtils.user.listExamResults.queryOptions(),
	);

	return (
		<div>
			<h2 className="mb-4 font-bold text-2xl">Exam Results</h2>
			<DataTable columns={columns} data={examResults.results} />
		</div>
	);
};

export const ExamResultsTableSkeleton = () => {
	return (
		<div className="w-full">
			<h2 className="mb-4 font-bold text-2xl">Exam Results</h2>
			<div className="rounded-md border">
				{/* Table Header */}
				<div className="border-b bg-muted/50 px-4 py-3">
					<div className="flex items-center space-x-4">
						<Skeleton className="h-4 w-1/4" />
						<Skeleton className="h-4 w-1/4" />
						<Skeleton className="h-4 w-1/4" />
						<Skeleton className="h-4 w-1/4" />
					</div>
				</div>

				{/* Table Rows */}
				{Array.from({ length: 5 }, (_, i) => (
					<div
						key={i.toString()}
						className="border-b px-4 py-3 last:border-b-0"
					>
						<div className="flex items-center space-x-4">
							<div className="w-1/4">
								<Skeleton className="h-4 w-3/4" />
							</div>
							<div className="w-1/4">
								<Skeleton className="h-4 w-1/2" />
							</div>
							<div className="w-1/4">
								<Skeleton className="h-4 w-1/2" />
							</div>
							<div className="w-1/4">
								<Skeleton className="h-5 w-20" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

const columns: ColumnDef<UserExamResultType>[] = [
	{
		accessorKey: "examName",
		header: "Exam Name",
	},
	{
		accessorKey: "completedAt",
		header: "Date",
		cell: ({ row }) => (
			<span>{new Date(row.getValue("completedAt")).toLocaleDateString()}</span>
		),
	},
	{
		header: "Score",
		cell: ({ row }) => (
			<span>
				{row.original.marks} / {row.original.totalMarks}
			</span>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<Badge
				variant={
					row.getValue("status") === "passed" ? "default" : "destructive"
				}
			>
				{row.getValue("status")}
			</Badge>
		),
	},
];
