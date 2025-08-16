import type { ExamType } from "@server/lib/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	MoreHorizontal,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";

const columns: ColumnDef<ExamType>[] = [
	{
		accessorKey: "certification",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Name
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => (
			<span className="font-medium">{row.getValue("certification")}</span>
		),
	},
	{
		accessorKey: "mark",
		header: () => <div className="text-right">Mark</div>,
		cell: ({ row }) => <div className="text-right">{row.getValue("mark")}</div>,
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const exam = row.original;
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
							onClick={() => navigator.clipboard.writeText(exam.id)}
						>
							Copy Exam ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>View details</DropdownMenuItem>
						<DropdownMenuItem>Delete</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

export function ExamsTable({
	limit = 10,
	page = 1,
}: {
	limit?: number;
	page?: number;
}) {
	const {
		data: { exams, totalPages, hasNextPage, hasPreviousPage },
	} = useSuspenseQuery(
		queryUtils.exam.listExams.queryOptions({
			input: {
				limit,
				page,
			},
		}),
	);

	return (
		<>
			<DataTable columns={columns} data={exams} />
			<Pagination className="my-4">
				<PaginationContent>
					<PaginationItem>
						<Link
							to="/dashboard/exams"
							search={{ page: Math.max(1, page - 1), limit }}
							className={cn(
								buttonVariants({
									variant: "outline",
									size: "icon",
								}),
								!hasPreviousPage && "pointer-events-none opacity-50",
							)}
							aria-disabled={!hasPreviousPage}
							tabIndex={!hasPreviousPage ? -1 : 0}
						>
							<ChevronLeft className="size-4.5" />
						</Link>
					</PaginationItem>
					{Array.from({ length: totalPages }, (_, i) => {
						const pageNum = i + 1;
						return (
							<PaginationItem key={pageNum}>
								<Link
									to="/dashboard/exams"
									search={{ page: pageNum, limit }}
									className={cn(
										buttonVariants({
											variant: "outline",
											size: "icon",
										}),
										page === pageNum &&
											"bg-accent font-bold text-accent-foreground hover:bg-accent hover:text-accent-foreground",
									)}
									aria-current={page === pageNum ? "page" : undefined}
								>
									{pageNum}
								</Link>
							</PaginationItem>
						);
					})}
					<PaginationItem>
						<Link
							to="/dashboard/exams"
							search={{ page: Math.min(totalPages, page + 1), limit }}
							className={cn(
								buttonVariants({
									variant: "outline",
									size: "icon",
								}),
								!hasNextPage && "pointer-events-none opacity-50",
							)}
							aria-disabled={!hasNextPage}
							tabIndex={!hasNextPage ? -1 : 0}
						>
							<ChevronRight className="size-4.5" />
						</Link>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</>
	);
}
