import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { UserWithRole } from "better-auth/plugins/admin";
import {
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	Eye,
	MoreHorizontal,
	Shield,
	ShieldOff,
	Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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

	const { mutateAsync: deleteUser, isPending: isDeletingUser } = useMutation({
		mutationFn: async ({ userId }: { userId: string }) => {
			await authClient.admin.removeUser({ userId });
		},
		onSettled: () => {
			refetchUserList();
		},
	});

	const { mutateAsync: banUser, isPending: isBanningUser } = useMutation({
		mutationFn: async ({ userId }: { userId: string }) => {
			await authClient.admin.banUser({ userId });
		},
		onSettled: () => {
			refetchUserList();
		},
	});

	const { mutateAsync: unbanUser, isPending: isUnbanningUser } = useMutation({
		mutationFn: async ({ userId }: { userId: string }) => {
			await authClient.admin.unbanUser({ userId });
		},
		onSettled: () => {
			refetchUserList();
		},
	});

	const users = usersData.users;

	const handleLimitChange = (newLimit: string) => {
		navigate({
			to: "/dashboard/users",
			search: { page: 1, limit: Number.parseInt(newLimit, 10) },
		});
	};

	const columns: ColumnDef<UserWithRole>[] = [
		{
			accessorKey: "name",
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
				<div className="flex flex-col">
					<span className="font-medium">{row.getValue("name") || "N/A"}</span>
					<span className="text-muted-foreground text-sm">
						{row.original.email}
					</span>
				</div>
			),
		},
		{
			accessorKey: "emailVerified",
			header: "Status",
			cell: ({ row }) => (
				<div className="flex flex-col gap-1">
					<Badge variant={row.original.emailVerified ? "default" : "secondary"}>
						{row.original.emailVerified ? "Verified" : "Unverified"}
					</Badge>
					{row.original.banned && <Badge variant="destructive">Banned</Badge>}
				</div>
			),
		},
		{
			accessorKey: "role",
			header: "Role",
			cell: ({ row }) => (
				<Badge variant="outline">{row.original.role || "user"}</Badge>
			),
		},
		{
			accessorKey: "createdAt",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Created
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<span className="text-sm">
					{row.original.createdAt
						? new Date(row.original.createdAt).toLocaleDateString()
						: "N/A"}
				</span>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const user = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="h-8 w-8 p-0"
								disabled={isDeletingUser || isBanningUser || isUnbanningUser}
							>
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => navigator.clipboard.writeText(user.id)}
							>
								<Eye className="mr-2 h-4 w-4" />
								Copy User ID
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							{user.banned ? (
								<DropdownMenuItem
									onClick={() => unbanUser({ userId: user.id })}
									className="text-green-600"
								>
									<ShieldOff className="mr-2 h-4 w-4" />
									Unban User
								</DropdownMenuItem>
							) : (
								<DropdownMenuItem
									onClick={() => banUser({ userId: user.id })}
									className="text-yellow-600"
								>
									<Shield className="mr-2 h-4 w-4" />
									Ban User
								</DropdownMenuItem>
							)}
							<DropdownMenuItem
								onClick={() => deleteUser({ userId: user.id })}
								className="text-red-600"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete User
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	// Calculate pagination info
	const totalPages = usersData.totalPages;
	const hasNextPage = usersData.hasNextPage;
	const hasPreviousPage = usersData.hasPreviousPage;

	return (
		<>
			<DataTable columns={columns} data={users} />
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
				<Pagination className="mx-0 w-fit justify-end">
					<PaginationContent>
						<PaginationItem>
							<Link
								to="/dashboard/users"
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
						{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
							const pageNum = i + 1;
							return (
								<PaginationItem key={pageNum}>
									<Link
										to="/dashboard/users"
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
								to="/dashboard/users"
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
		</>
	);
};

export const UsersTableSkeleton = ({ limit = 10 }: { limit?: number }) => {
	return (
		<>
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
									<div className="flex flex-col gap-1">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-48" />
									</div>
									<div className="flex-1" />
									<div className="flex flex-col gap-1">
										<Skeleton className="h-5 w-16" />
									</div>
									<Skeleton className="h-5 w-12" />
									<Skeleton className="h-4 w-20" />
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
		</>
	);
};
