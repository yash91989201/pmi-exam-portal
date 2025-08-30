import type { ExamType } from "@server-types/index";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
	ChevronLeft,
	ChevronRight,
	MoreHorizontal,
	Trash2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";

export const ExamsTable = ({
	limit = 10,
	page = 1,
}: {
	limit?: number;
	page?: number;
}) => {
	const navigate = useNavigate();
	const {
		data: { exams, totalPages, hasNextPage, hasPreviousPage },
		refetch,
	} = useSuspenseQuery(
		queryUtils.admin.listExams.queryOptions({
			input: {
				limit,
				page,
			},
		}),
	);

	const { mutate: deleteExam } = useMutation(
		queryUtils.admin.deleteExam.mutationOptions({
			onSuccess: () => {
				refetch();
			},
		}),
	);

	const handleDeleteExam = (examId: string) => {
		deleteExam({ id: examId });
	};

	const handleLimitChange = (limit: number) => {
		navigate({
			to: "/dashboard/exams",
			search: { page: 1, limit },
		});
	};

	return (
		<section>
			<DataTable columns={getColumns({ handleDeleteExam })} data={exams} />
			<div className="my-4 flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<span className="text-sm">Rows per page</span>
					<Select
						value={limit.toString()}
						onValueChange={(value) => handleLimitChange(+value)}
					>
						<SelectTrigger className="w-[70px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="5">5</SelectItem>
							<SelectItem value="10">10</SelectItem>
							<SelectItem value="20">20</SelectItem>
							<SelectItem value="50">50</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<Pagination className="mx-0 w-fit justify-end">
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
			</div>
		</section>
	);
};

const getColumns = ({
	handleDeleteExam,
}: {
	handleDeleteExam: (examId: string) => void;
}): ColumnDef<ExamType>[] => [
	{
		accessorKey: "certification",
		header: () => "Certification",
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
		header: () => <div className="">Actions</div>,
		cell: ({ row }) => {
			const exam = row.original;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => handleDeleteExam(exam.id)}
							className="text-red-600"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

export const ExamsTableSkeleton = ({ limit = 10 }: { limit?: number }) => {
	return (
		<section>
			{/* Table Header and Rows Skeleton */}
			<div className="w-full">
				<div className="rounded-md border">
					{/* Table Header */}
					<div className="border-b bg-muted/50 px-4 py-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-4 w-16" />
								<Skeleton className="h-4 w-16" />
							</div>
						</div>
					</div>

					{/* Table Rows */}
					{Array.from({ length: limit }, (_, i) => (
						<div
							key={i.toString()}
							className="border-b px-4 py-3 last:border-b-0"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-4">
									<Skeleton className="h-4 w-32" />
									<div className="flex-1" />
									<Skeleton className="h-4 w-12" />
								</div>
								<Skeleton className="h-8 w-8 rounded" />
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Pagination Skeleton */}
			<div className="my-4 flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-9 w-[70px]" />
				</div>
				<div className="flex items-center space-x-1">
					<Skeleton className="h-9 w-9" />
					<Skeleton className="h-9 w-9" />
					<Skeleton className="h-9 w-9" />
					<Skeleton className="h-9 w-9" />
					<Skeleton className="h-9 w-9" />
				</div>
			</div>
		</section>
	);
};
