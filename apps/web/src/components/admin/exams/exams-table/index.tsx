import type { ExamType } from "@server-types/index";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { PaginationWindow } from "@/components/shared/pagination-window";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useExamsTableFilter } from "@/hooks/use-exams-table-filter";
import { queryUtils } from "@/utils/orpc";

export const ExamsTable = () => {
	const {
		page,
		limit,
		certification,
		internalSearch,
		setInternalSearch,
		onLimitChange,
	} = useExamsTableFilter();

	const {
		data: { exams, totalPages, hasNextPage, hasPreviousPage },
		refetch,
	} = useSuspenseQuery(
		queryUtils.admin.listExams.queryOptions({
			input: {
				limit,
				page,
				search: {
					certification,
				},
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

	const columns: ColumnDef<ExamType>[] = [
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
			cell: ({ row }) => (
				<div className="text-right">{row.getValue("mark")}</div>
			),
		},
		{
			id: "actions",
			header: () => <div className="text-right">Actions</div>,
			cell: ({ row }) => {
				const exam = row.original;
				return (
					<div className="text-right">
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
					</div>
				);
			},
		},
	];

	// Initialize table with useReactTable hook
	const table = useReactTable({
		data: exams,
		columns,
		getCoreRowModel: getCoreRowModel(),
		// No pagination model - we're handling pagination server-side
	});

	return (
		<section>
			<div className="flex items-center py-4">
				<Input
					placeholder="Filter by certification..."
					value={internalSearch}
					onChange={(event) => setInternalSearch(event.target.value)}
					className="max-w-sm"
				/>
			</div>
			<div className="flex flex-col gap-3">
				<div className="overflow-hidden rounded-md border">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-muted/50">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id} className="font-semibold">
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
					</Table>
					{/* Scrollable table body container */}
					<div className="max-h-[calc(100vh-24rem)] overflow-y-scroll">
						<Table>
							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)}
												</TableCell>
											))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-24 text-center"
										>
											No results.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			</div>

			{/* Custom pagination controls */}
			<div className="my-4 flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<span className="text-sm">Rows per page</span>
					<Select
						value={limit.toString()}
						onValueChange={(value) => onLimitChange(+value)}
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
				<PaginationWindow
					page={page}
					limit={limit}
					totalPages={totalPages}
					basePath={"/dashboard/exams"}
					search={{ certification }}
					hasNextPage={hasNextPage}
					hasPreviousPage={hasPreviousPage}
				/>
			</div>
		</section>
	);
};

export const ExamsTableSkeleton = () => {
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
					{Array.from({ length: 10 }, (_, i) => (
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
