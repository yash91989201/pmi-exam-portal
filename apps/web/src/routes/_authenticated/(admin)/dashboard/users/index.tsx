import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import z from "zod";
import { BulkCreateUserForm } from "@/components/admin/user/bulk-create-user-form";
import { CreateUserForm } from "@/components/admin/user/create-user-form";
import {
	UsersTable,
	UsersTableSkeleton,
} from "@/components/admin/users/users-table";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const RouteSearchSchema = z.object({
	page: z.number().min(1).default(1).catch(1),
	limit: z.number().min(1).max(50).default(10).catch(10),
});

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/",
)({
	validateSearch: RouteSearchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const { limit, page } = Route.useSearch();

	return (
		<div className="container mx-auto">
			<div className="flex flex-col gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="mb-1 font-bold text-3xl tracking-tight">
								Manage Users
							</CardTitle>
							<CardDescription className="max-w-lg">
								View and manage user accounts, including banning, unbanning, and
								deleting users.
							</CardDescription>
						</div>
						<div className="flex items-end gap-3">
							<CreateUserForm />
							<BulkCreateUserForm />
						</div>
					</CardHeader>
					<CardContent>
						<Suspense fallback={<UsersTableSkeleton limit={limit} />}>
							<UsersTable limit={limit} page={page} />
						</Suspense>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
