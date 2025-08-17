import { createFileRoute, Link } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { Suspense } from "react";
import z from "zod";
import {
	UsersTable,
	UsersTableSkeleton,
} from "@/components/admin/users/users-table";
import { Button } from "@/components/ui/button";
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
						<Button asChild>
							<Link to="/dashboard/users/create-user">
								<UserPlus className="mr-1 size-4" />
								<span>Create New User</span>
							</Link>
						</Button>
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
