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
import { BookCheck, BookX, CircleX, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { queryClient, queryUtils } from "@/utils/orpc";

type ExamAssignment = {
	examId: string;
	examCertification: string;
	assigned: boolean;
};

type UpdateExamsAssignmentTableProps = {
	userId: string;
	examsAssignedStatus: ExamAssignment[];
	searchQuery: string | undefined;
	onSearchQueryChange: (query: string) => void;
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
	examsAssignedStatus: initialExamsAssignedStatus,
	searchQuery,
	onSearchQueryChange,
}: UpdateExamsAssignmentTableProps) => {
	const [rowSelection, setRowSelection] = useState({});
	const [examsAssignedStatus, setExamsAssignedStatus] = useState(
		initialExamsAssignedStatus,
	);
	const [internalSearch, setInternalSearch] = useState(searchQuery ?? "");

	useEffect(() => {
		const handler = setTimeout(() => {
			onSearchQueryChange(internalSearch);
		}, 500);

		return () => {
			clearTimeout(handler);
		};
	}, [internalSearch, onSearchQueryChange]);

	useEffect(() => {
		setExamsAssignedStatus(initialExamsAssignedStatus);
	}, [initialExamsAssignedStatus]);

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

	const assignedExamsCount = useMemo(
		() => examsAssignedStatus.filter((e) => e.assigned).length,
		[examsAssignedStatus],
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
			<div className="space-y-3">
				<h3 className="font-medium text-lg">Exam Assignments</h3>
				<p className="text-muted-foreground text-sm">
					Assign or unassign exams for this user. Only exams with no attempts
					can be un-assigned.
				</p>

				{initialExamsAssignedStatus.length > 0 && (
					<div className="flex gap-3">
						<Badge
							variant="outline"
							className="border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300"
						>
							Total exams: {initialExamsAssignedStatus.length}
						</Badge>
						<Badge
							variant="outline"
							className="border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/50 dark:text-green-300"
						>
							Assigned exams: {assignedExamsCount}
						</Badge>
					</div>
				)}
			</div>

			<div className="flex items-center justify-between">
				<div className="relative flex items-center gap-3">
					<span className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground">
						<Search className="size-4.5" />
					</span>
					<Input
						placeholder="Search by exam name..."
						value={internalSearch}
						onChange={(e) => setInternalSearch(e.target.value)}
						className="w-96 px-9 py-6"
					/>
					<span className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground">
						<CircleX
							onClick={() => setInternalSearch("")}
							className="size-4.5 cursor-pointer"
						/>
					</span>
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
		</div>
	);
};

export const UpdateExamsAssignmentTableSkeleton = () => {
	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<Skeleton className="h-7 w-64" />
				<Skeleton className="h-4 w-3/4" />

				<div className="flex gap-3">
					<Skeleton className="h-6 w-24 rounded-full" />
					<Skeleton className="h-6 w-24 rounded-full" />
				</div>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{[...Array(4)].map((_, i) => (
								<TableHead key={i.toString()}>
									<Skeleton className="h-5 w-full" />
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{[...Array(5)].map((_, i) => (
							<TableRow key={i.toString()}>
								{[...Array(4)].map((_, j) => (
									<TableCell key={j.toString()}>
										<Skeleton className="h-4 w-full" />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<div className="flex justify-end space-x-3 pt-4">
				<Skeleton className="h-10 w-24 rounded-md" />
				<Skeleton className="h-10 w-32 rounded-md" />
			</div>
		</div>
	);
};
