import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { UserWithRole } from "better-auth/plugins/admin";
import {
	ClipboardPen,
	ExternalLink,
	ListOrdered,
	MoreHorizontal,
	Settings,
	Shield,
	ShieldOff,
	Trash2,
} from "lucide-react";
import { PaginationWindow } from "@/components/shared/pagination-window";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";

export const UsersTable = ({
	limit = 10,
	page = 1,
}: {
	limit?: number;
	page?: number;
}) => {
	const navigate = useNavigate();

	const { data: usersData, refetch: refetchUserList } = useSuspenseQuery(
		queryUtils.admin.listUsers.queryOptions({
			input: {
				limit,
				page,
			},
		}),
	);

	const { mutateAsync: deleteUser } = useMutation({
		mutationFn: async ({ userId }: { userId: string }) => {
			await authClient.admin.removeUser({ userId });
		},
		onSettled: () => {
			refetchUserList();
		},
	});

	const { mutateAsync: banUser } = useMutation({
		mutationFn: async ({ userId }: { userId: string }) => {
			await authClient.admin.banUser({ userId });
		},
		onSettled: () => {
			refetchUserList();
		},
	});

	const { mutateAsync: unbanUser } = useMutation({
		mutationFn: async ({ userId }: { userId: string }) => {
			await authClient.admin.unbanUser({ userId });
		},
		onSettled: () => {
			refetchUserList();
		},
	});

	const users = usersData.users;
	// Pagination Info
	const totalPages = usersData.totalPages;
	const hasNextPage = usersData.hasNextPage;
	const hasPreviousPage = usersData.hasPreviousPage;

	const handleBanUser = (userId: string) => {
		banUser({ userId });
	};

	const handleUnbanUser = (userId: string) => {
		unbanUser({ userId });
	};

	const handleDeleteUser = (userId: string) => {
		deleteUser({ userId });
	};

	const handleLimitChange = (newLimit: string) => {
		navigate({
			to: "/dashboard/users",
			search: { page: 1, limit: Number.parseInt(newLimit, 10) },
		});
	};

	const columns: ColumnDef<UserWithRole>[] = [
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="font-medium">{row.getValue("name") || "N/A"}</span>
					<span className="text-muted-foreground text-sm">
						{row.original.email}
					</span>
				</div>
			),
		},
		{
			accessorKey: "createdAt",
			header: "Created At",
			cell: ({ row }) => (
				<span className="text-sm">
					{row.original.createdAt
						? new Date(row.original.createdAt).toLocaleDateString()
						: "N/A"}
				</span>
			),
		},
		{
			id: "exams-info",
			header: () => <div className="text-right">Exams Info</div>,
			cell: ({ row }) => (
				<div className="text-right">
					<Link
						className={buttonVariants({ variant: "outline", size: "icon" })}
						to="/dashboard/users/$userId"
						params={{ userId: row.original.id }}
					>
						<ExternalLink className="size-4.5" />
					</Link>
				</div>
			),
		},
		{
			id: "actions",
			header: () => <div className="text-right">Actions</div>,
			cell: ({ row }) => {
				const user = row.original;
				return (
					<div className="text-right">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-8 w-8 p-0">
									<span className="sr-only">Open menu</span>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuItem>
									<Link
										to="/dashboard/users/$userId/manage-exams-assignment"
										params={{ userId: row.original.id }}
										className="flex items-center gap-1.5"
									>
										<ClipboardPen className="size-4.5" />
										<span>Assign / Un-Assign Exams</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Link
										to="/dashboard/users/$userId/manage-order"
										params={{ userId: row.original.id }}
										className="flex items-center gap-1.5"
									>
										<ListOrdered className="size-4.5" />
										<span>Manage Orders</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Link
										to="/dashboard/users/$userId/manage-user"
										params={{ userId: row.original.id }}
										className="flex items-center gap-1.5"
									>
										<Settings className="size-4.5" />
										<span>Manage User</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								{user.banned ? (
									<DropdownMenuItem
										onClick={() => handleUnbanUser(user.id)}
										className="text-green-600"
									>
										<ShieldOff className="mr-2 h-4 w-4" />
										Unban User
									</DropdownMenuItem>
								) : (
									<DropdownMenuItem
										onClick={() => handleBanUser(user.id)}
										className="text-yellow-600"
									>
										<Shield className="mr-2 h-4 w-4" />
										Ban User
									</DropdownMenuItem>
								)}
								<DropdownMenuItem
									onClick={() => handleDeleteUser(user.id)}
									className="text-red-600"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete User
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
		data: users,
		columns,
		getCoreRowModel: getCoreRowModel(),
		// No pagination model - we're handling pagination server-side
	});

	return (
		<section>
			{/* Table implementation with scrollable body */}
			<div className="flex flex-col gap-3">
				<div className="overflow-hidden rounded-md border">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-muted/50">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead
												key={header.id}
												className={cn(
													"font-semibold",
													header.column.id === "exams-info" && "text-right",
													header.column.id === "actions" && "text-right",
												)}
											>
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
					<div className="max-h-[calc(100vh-24rem)] overflow-y-auto">
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
					<Select value={limit.toString()} onValueChange={handleLimitChange}>
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
					basePath="/dashboard/users"
					hasNextPage={hasNextPage}
					hasPreviousPage={hasPreviousPage}
				/>
			</div>
		</section>
	);
};

export const UsersTableSkeleton = () => {
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
								<div className="flex items-center space-x-20">
									<div className="flex flex-col gap-y-1.5">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-3 w-36" />
									</div>
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-9 w-9 rounded" />
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
