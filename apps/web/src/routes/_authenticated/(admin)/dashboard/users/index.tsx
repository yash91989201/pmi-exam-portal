import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import z from "zod";
import { BulkCreateUserForm } from "@/components/admin/user/bulk-create-user-form";
import { CreateUserForm } from "@/components/admin/user/create-user-form";
import {
	UsersTable,
	UsersTableSkeleton,
} from "@/components/admin/users/users-table";

export const RouteSearchSchema = z.object({
	page: z.number().min(1).default(1).catch(1),
	limit: z.number().min(1).max(50).default(10).catch(10),
});

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/",
)({
	validateSearch: RouteSearchSchema,
	beforeLoad: async ({ context: { queryClient, queryUtils }, search }) => {
		queryClient.ensureQueryData(
			queryUtils.admin.listUsers.queryOptions({
				input: search,
			}),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { limit, page } = Route.useSearch();

	return (
		<div className="space-y-6">
			<section className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-3xl tracking-tight">Manage Users</h2>
					<p className="">
						View and manage user accounts, including banning, unbanning, and
						deleting users.
					</p>
				</div>
				<div className="flex items-end gap-3">
					<CreateUserForm />
					<BulkCreateUserForm />
				</div>
			</section>
			<Suspense fallback={<UsersTableSkeleton limit={limit} />}>
				<UsersTable limit={limit} page={page} />
			</Suspense>
		</div>
	);
}
