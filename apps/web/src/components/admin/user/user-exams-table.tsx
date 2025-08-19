import type { GetUserExamsDataOutputType } from "@server-types/index";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { queryUtils } from "@/utils/orpc";

export const UserExamsTable = ({ userId }: { userId: string }) => {
	const {
		data: { userExamsData },
		refetch: refetchUserExamsData,
	} = useSuspenseQuery(
		queryUtils.admin.getUserExamsData.queryOptions({ input: { userId } }),
	);

	const { mutateAsync: increaseUserExamAttempts } = useMutation(
		queryUtils.admin.increaseUserExamAttempts.mutationOptions({
			onSettled: () => {
				refetchUserExamsData();
			},
		}),
	);

	return (
		<DataTable
			columns={getColumns(increaseUserExamAttempts)}
			data={userExamsData}
		/>
	);
};

const getColumns = (
	increaseUserExamAttempts: (input: { userExamId: string }) => Promise<any>,
): ColumnDef<GetUserExamsDataOutputType["userExamsData"][0]>[] => [
	{
		accessorKey: "examCertification",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Exam Name
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => (
			<span className="font-medium">{row.original.exam.certification}</span>
		),
	},
	{
		accessorKey: "assignedAt",
		header: () => <div className="text-right">Assigned At</div>,
		cell: ({ row }) => (
			<div className="text-right">
				{row.getValue("assignedAt")
					? new Date(row.getValue("assignedAt")).toLocaleString()
					: "-"}
			</div>
		),
	},
	{
		accessorKey: "attempts",
		header: () => <div className="text-right">Attempts</div>,
		cell: ({ row }) => (
			<div className="text-right">{row.getValue("attempts")}</div>
		),
	},
	{
		accessorKey: "maxAttempts",
		header: () => <div className="text-right">Max Attempts</div>,
		cell: ({ row }) => (
			<div className="text-right">{row.getValue("maxAttempts")}</div>
		),
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const userExam = row.original;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => navigator.clipboard.writeText(userExam.examId)}
						>
							Copy Exam ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>View details</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() =>
								increaseUserExamAttempts({ userExamId: userExam.id })
							}
						>
							Increase Attempts
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

export const UserExamsTableSkeleton = () => {
	return (
		<div className="flex flex-col gap-3">
			<div className="overflow-hidden rounded-md border">
				<table className="w-full caption-bottom text-sm">
					<thead className="[&_tr]:border-b">
						<tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
							<th className="h-12 w-[200px] px-4 text-left align-middle font-semibold text-gray-700 [&:has([role=checkbox])]:pr-0">
								<Skeleton className="h-5 w-3/4" />
							</th>
							<th className="h-12 px-4 text-right align-middle font-semibold text-gray-700 [&:has([role=checkbox])]:pr-0">
								<Skeleton className="ml-auto h-5 w-1/2" />
							</th>
							<th className="h-12 px-4 text-right align-middle font-semibold text-gray-700 [&:has([role=checkbox])]:pr-0">
								<Skeleton className="ml-auto h-5 w-1/3" />
							</th>
							<th className="h-12 px-4 text-right align-middle font-semibold text-gray-700 [&:has([role=checkbox])]:pr-0">
								<Skeleton className="ml-auto h-5 w-1/2" />
							</th>
							<th className="h-12 w-[50px] px-4 text-right align-middle font-semibold text-gray-700 [&:has([role=checkbox])]:pr-0">
								<span className="sr-only">Actions</span>
							</th>
						</tr>
					</thead>
					<tbody className="[&_tr:last-child]:border-0">
						{[...Array(5)].map((_, i) => (
							<tr
								key={i.toString()}
								className="border-b bg-white transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
							>
								<td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
									<Skeleton className="h-4 w-5/6" />
								</td>
								<td className="p-4 text-right align-middle [&:has([role=checkbox])]:pr-0">
									<Skeleton className="ml-auto h-4 w-2/3" />
								</td>
								<td className="p-4 text-right align-middle [&:has([role=checkbox])]:pr-0">
									<Skeleton className="ml-auto h-4 w-1/4" />
								</td>
								<td className="p-4 text-right align-middle [&:has([role=checkbox])]:pr-0">
									<Skeleton className="ml-auto h-4 w-1/4" />
								</td>
								<td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
									<Skeleton className="ml-auto h-8 w-8 rounded-md" />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
