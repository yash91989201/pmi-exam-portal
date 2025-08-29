import { useMutation } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { BookCheck, BookX, FilterX, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useManageExamsAssignmentFilter } from "@/hooks/use-manage-exams-assignment-filter";
import { queryClient, queryUtils } from "@/utils/orpc";

type ExamAssignment = {
	examId: string;
	examCertification: string;
	assigned: boolean;
};

type UpdateExamsAssignmentTableProps = {
	userId: string;
	examsAssignedStatus: ExamAssignment[];
	nextCursor: string | null | undefined;
};

const getColumns = (): ColumnDef<ExamAssignment>[] => [
	{
		id: "select",
		cell: ({ row, table }) => {
			const selectedRows = table.getSelectedRowModel().rows;
			const hasSelectedAssigned = selectedRows.some((r) => r.original.assigned);
			const hasSelectedUnassigned = selectedRows.some(
				(r) => !r.original.assigned,
			);

			let isDisabled = false;
			if (hasSelectedAssigned) {
				isDisabled = !row.original.assigned;
			} else if (hasSelectedUnassigned) {
				isDisabled = row.original.assigned;
			}

			if (row.getIsSelected()) {
				isDisabled = false;
			}

			return (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
					className="size-4.5 translate-y-[2px]"
					disabled={isDisabled}
				/>
			);
		},
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "examCertification",
		header: "Exam",
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("examCertification")}</div>
		),
	},
	{
		accessorKey: "assigned",
		header: "Status",
		cell: ({ row }) => {
			const isAssigned = row.getValue("assigned");
			return (
				<Badge variant={isAssigned ? "default" : "outline"}>
					{isAssigned ? "Assigned" : "Not Assigned"}
				</Badge>
			);
		},
	},
];

export const UpdateExamsAssignmentTable = ({
	userId,
	examsAssignedStatus,
	nextCursor,
}: UpdateExamsAssignmentTableProps) => {
	const [rowSelection, setRowSelection] = useState({});

	const {
		searchQuery,
		internalSearch,
		setInternalSearch,
		status,
		onStatusChange,
		onClearFilters,
		goToNextPage,
		goToPreviousPage,
		canGoPrevious,
	} = useManageExamsAssignmentFilter({ userId });

	const { mutateAsync: updateExamsAssignmentStatusMutation, isPending } =
		useMutation(
			queryUtils.admin.updateExamsAssignedStatus.mutationOptions({
				onSuccess: (data: { message: string; success: boolean }) => {
					toast.success(data.message);
					queryClient.invalidateQueries(
						queryUtils.admin.getExamsAssignedStatus.queryOptions({
							input: { userId },
						}),
					);
					queryClient.invalidateQueries(
						queryUtils.admin.getUserExamsData.queryOptions({
							input: { userId },
						}),
					);
					table.resetRowSelection();
				},
				onError: (error: Error) => {
					toast.error(error.message || "Failed to update exam assignments");
				},
			}),
		);

	const columns: ColumnDef<ExamAssignment>[] = useMemo(() => getColumns(), []);

	const table = useReactTable({
		data: examsAssignedStatus,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onRowSelectionChange: setRowSelection,
		state: {
			rowSelection,
		},
	});

	const handleBulkAction = async (assign: boolean) => {
		const selectedExamIds = table
			.getSelectedRowModel()
			.rows.map((row) => row.original.examId);

		const newExamsAssignedStatus = examsAssignedStatus.map((exam) =>
			selectedExamIds.includes(exam.examId)
				? { ...exam, assigned: assign }
				: exam,
		);

		await updateExamsAssignmentStatusMutation({
			userId,
			examsAssignedStatus: newExamsAssignedStatus.map(
				({ examId, assigned }) => ({
					examId,
					assigned,
				}),
			),
		});
	};

	const selectedRows = table.getSelectedRowModel().rows;
	const areAnyRowsSelected = selectedRows.length > 0;
	const areAllSelectedAssigned =
		areAnyRowsSelected && selectedRows[0].original.assigned;

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h3 className="font-medium text-lg">Assign / Un-Assign Exams</h3>
				<p className="text-muted-foreground text-sm">
					Assign or unassign exams for this user. Only exams with no attempts
					can be un-assigned.
				</p>
			</div>

			<div className="flex items-center justify-between">
				<div className="flex flex-1 items-center gap-3">
					<div className="relative grid w-full max-w-sm gap-1.5">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by exam name..."
							value={internalSearch}
							onChange={(e) => setInternalSearch(e.target.value)}
							className="w-full pl-10"
						/>
					</div>

					<Select
						value={status ?? "all"}
						onValueChange={(value) =>
							onStatusChange(value as "all" | "assigned" | "unassigned")
						}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value="assigned">Assigned</SelectItem>
							<SelectItem value="unassigned">Unassigned</SelectItem>
						</SelectContent>
					</Select>
					<Button
						size="icon"
						variant="destructive"
						onClick={onClearFilters}
						disabled={
							(!searchQuery || searchQuery.trim() === "") && status === "all"
						}
					>
						<FilterX className="size-4.5" />
					</Button>
				</div>
				<div className="flex items-center gap-2">
					{areAnyRowsSelected &&
						(areAllSelectedAssigned ? (
							<Button
								size="sm"
								type="button"
								variant="outline"
								onClick={() => handleBulkAction(false)}
								disabled={isPending}
							>
								<BookX className="mr-2 h-4 w-4" />
								Unassign Selected ({selectedRows.length})
							</Button>
						) : (
							<Button
								size="sm"
								type="button"
								onClick={() => handleBulkAction(true)}
								disabled={isPending}
							>
								<BookCheck className="mr-2 h-4 w-4" />
								Assign Selected ({selectedRows.length})
							</Button>
						))}
				</div>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
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
									No exams to display.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end py-4">
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={goToPreviousPage}
						disabled={!canGoPrevious}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							if (!nextCursor) return;
							goToNextPage(nextCursor);
						}}
						disabled={!nextCursor}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
};

export const UpdateExamsAssignmentTableSkeleton = () => {
	return (
		<div className="space-y-4">
			<div className="space-y-3">
				<Skeleton className="h-7 w-64" />
				<Skeleton className="h-4 w-3/4" />

				<div className="flex gap-3">
					<Skeleton className="h-6 w-24 rounded-full" />
					<Skeleton className="h-6 w-24 rounded-full" />
				</div>
			</div>
			<div className="my-4 flex items-center justify-between">
				<div className="flex flex-1 items-center space-x-2">
					<div className="grid w-full max-w-sm gap-1.5">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="grid gap-1.5">
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-10 w-[180px]" />
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-10 w-24" />
				</div>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{[...Array(3)].map((_, i) => (
								<TableHead key={i.toString()}>
									<Skeleton className="h-5 w-full" />
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{[...Array(10)].map((_, i) => (
							<TableRow key={i.toString()}>
								{[...Array(3)].map((_, j) => (
									<TableCell key={j.toString()}>
										<Skeleton className="h-4 w-full" />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end py-4">
				<div className="flex items-center space-x-2">
					<Skeleton className="h-10 w-20" />
					<Skeleton className="h-10 w-20" />
				</div>
			</div>
		</div>
	);
};
