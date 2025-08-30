import type { GetUserExamsDataOutputType } from "@server-types/index";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Info, MoreHorizontal } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
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
		<section className="space-y-3">
			<h2 className="font-bold text-xl">Exams Results</h2>

			<DataTable
				columns={getColumns(increaseUserExamAttempts)}
				data={userExamsData}
			/>
		</section>
	);
};

const getColumns = (
	increaseUserExamAttempts: (input: { userExamId: string }) => Promise<any>,
): ColumnDef<GetUserExamsDataOutputType["userExamsData"][0]>[] => [
	{
		accessorKey: "exam.certification",
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
			<span className="font-medium">{row.original.certification}</span>
		),
	},
	{
		accessorKey: "status",
		header: () => <div className="text-right">Status</div>,
		cell: ({ row }) => {
			const { status, terminationReason } = row.original;
			if (status === null) {
				return null;
			}

			if (status === "terminated") {
				return (
					<div className="flex items-center justify-end gap-1 text-right">
						<Badge variant={statusVariant[status]} className="capitalize">
							{status.split("_").join(" ")}
						</Badge>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<Info className="size-4.5 text-muted-foreground" />
								</TooltipTrigger>
								<TooltipContent className="space-y-1.5">
									<p className="font-semibold text-lg">Cheating Detected !!!</p>
									<p className="font-medium">{terminationReason}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				);
			}

			return (
				<div className="text-right">
					<Badge variant={statusVariant[status]} className="capitalize">
						{status.split("_").join(" ")}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "marks",
		header: () => <div className="text-right">Marks</div>,
		cell: ({ row }) => (
			<div className="text-right">{row.original.marks ?? "-"}</div>
		),
	},
	{
		accessorKey: "attemptNumber",
		header: () => <div className="text-right">Attempt</div>,
		cell: ({ row }) => (
			<div className="text-right">{row.original.attempt ?? "-"}</div>
		),
	},
	{
		accessorKey: "timeSpent",
		header: () => <div className="text-right">Time Spent (mins)</div>,
		cell: ({ row }) => (
			<div className="text-right">{row.original.timeSpent ?? "-"}</div>
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
							onClick={() =>
								increaseUserExamAttempts({ userExamId: userExam.userExamId })
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
		<section className="space-y-3">
			<h2 className="font-bold text-xl">Exams Results</h2>

			<div className="flex flex-col gap-3">
				<div className="overflow-hidden rounded-md border">
					<table className="w-full caption-bottom text-sm">
						<thead className="[&_tr]:border-b">
							<tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
								<th className="h-12 w-[200px] px-4 text-left align-middle font-semibold text-gray-700 [&:has([role=checkbox])]:pr-0">
									Exam Name
								</th>
								<th className="h-12 px-4 text-right align-middle font-semibold text-gray-700 [&:has([role=checkbox])]:pr-0">
									Status
								</th>
								<th className="h-12 px-4 text-right align-middle font-semibold text-gray-700 [&:has([role=checkbox])]:pr-0">
									Marks
								</th>
								<th className="h-12 px-4 text-right align-middle font-semibold text-gray-700 [&:has([role=checkbox])]:pr-0">
									Attempt
								</th>
								<th className="h-12 px-4 text-right align-middle font-semibold text-gray-700 [&:has([role=checkbox])]:pr-0">
									Time Spent (mins)
								</th>
								<th className="h-12 px-4 text-right align-middle font-semibold text-gray-700 [&:has([role=checkbox])]:pr-0">
									Max Attempts
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
										<Skeleton className="ml-auto h-5 w-20 rounded-full" />
									</td>
									<td className="p-4 text-right align-middle [&:has([role=checkbox])]:pr-0">
										<Skeleton className="ml-auto h-4 w-1/4" />
									</td>
									<td className="p-4 text-right align-middle [&:has([role=checkbox])]:pr-0">
										<Skeleton className="ml-auto h-4 w-1/4" />
									</td>
									<td className="p-4 text-right align-middle [&:has([role=checkbox])]:pr-0">
										<Skeleton className="ml-auto h-4 w-1/3" />
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
		</section>
	);
};

const statusVariant: Record<
	string,
	React.ComponentProps<typeof Badge>["variant"]
> = {
	assigned: "outline",
	in_progress: "secondary",
	started: "secondary",
	completed: "default",
	passed: "default",
	failed: "destructive",
	aborted: "destructive",
	terminated: "destructive",
};
