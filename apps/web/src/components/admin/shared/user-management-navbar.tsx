import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { ClipboardPen, ListOrdered, Settings, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";

export const UserManagementNavbar = ({ userId }: { userId: string }) => {
	const matchRoute = useMatchRoute();

	const { data: user } = useSuspenseQuery(
		queryUtils.admin.getUser.queryOptions({
			input: {
				userId,
			},
		}),
	);

	const isActiveRoute = (routePath: string) => {
		return matchRoute({ to: routePath, params: { userId } });
	};

	const navItems = [
		{
			path: "/dashboard/users/$userId/",
			label: `${user.name.split(" ")[0]}'s Exams Info`,
			icon: User,
		},
		{
			path: "/dashboard/users/$userId/manage-exams-assignment",
			label: "Assign / Un-Assign Exams",
			icon: ClipboardPen,
		},
		{
			path: "/dashboard/users/$userId/manage-order",
			label: "Manage Orders",
			icon: ListOrdered,
		},
		{
			path: "/dashboard/users/$userId/manage-user",
			label: "Manage User",
			icon: Settings,
		},
	];
	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h1 className="font-bold text-2xl text-foreground">User Management</h1>
				<p className="text-muted-foreground">
					View/manage user details, exam assignments, orders, and settings.
				</p>
			</div>

			<nav className="grid grid-cols-1 gap-3 md:grid-cols-4">
				{navItems.map((item) => {
					const Icon = item.icon;
					const isActive = isActiveRoute(item.path);

					return (
						<Link
							key={item.path}
							to={item.path}
							params={{ userId }}
							className={cn(
								"group flex items-center space-x-3 rounded-md border p-4 transition-all duration-200 hover:shadow-md",
								isActive
									? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/10"
									: "border-border bg-background hover:border-primary/20 hover:bg-accent/50",
							)}
						>
							<div
								className={cn(
									"rounded-md p-2 transition-colors",
									isActive
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
								)}
							>
								<Icon className="h-5 w-5" />
							</div>
							<h3
								className={cn(
									"font-semibold text-base text-ellepsis transition-colors",
									isActive
										? "text-primary"
										: "text-foreground group-hover:text-primary",
								)}
							>
								{item.label}
							</h3>
						</Link>
					);
				})}
			</nav>
		</div>
	);
};

export const UserManagementNavbarSkeleton = () => {
	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h1 className="font-bold text-2xl text-foreground">User Management</h1>
				<p className="text-muted-foreground">
					View/manage user details, exam assignments, orders, and settings.
				</p>
			</div>

			<nav className="grid grid-cols-1 gap-3 md:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<div
						key={i.toString()}
						className="flex items-center space-x-3 rounded-md border p-4"
					>
						<Skeleton className="size-9 shrink-0 rounded-md" />
						<Skeleton className="h-6 w-full" />
					</div>
				))}
			</nav>
		</div>
	);
};
