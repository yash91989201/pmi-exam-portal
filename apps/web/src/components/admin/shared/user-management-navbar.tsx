import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { BookOpenCheck, Settings, User } from "lucide-react";
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

	// Check if a route is active
	const isActiveRoute = (routePath: string) => {
		return matchRoute({ to: routePath, params: { userId } });
	};

	const navItems = [
		{
			path: "/dashboard/users/$userId/",
			label: "User Exams",
			icon: BookOpenCheck,
			description:
				"View user's exam info like stats, attempts, scores and response",
		},
		{
			path: "/dashboard/users/$userId/manage-exams-assignment",
			label: "Manage Exams Assignment",
			icon: Settings,
			description: "Manage exams assignment to user.",
		},
		{
			path: "/dashboard/users/$userId/manage-user",
			label: "Manage User",
			icon: User,
			description: "Edit user profile, update password etc.",
		},
	];
	return (
		<>
			<div>
				<h1 className="mb-2 font-bold text-2xl text-foreground">
					User Management
				</h1>
				<p className="text-muted-foreground">
					Manage user settings, exams, and permissions for User: {user?.name}
				</p>
			</div>

			<nav className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3">
				{navItems.map((item) => {
					const Icon = item.icon;
					const isActive = isActiveRoute(item.path);

					return (
						<Link
							key={item.path}
							to={item.path}
							params={{ userId }}
							className={cn(
								"group block rounded-lg border p-6 transition-all duration-200 hover:shadow-md",
								isActive
									? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/10"
									: "border-border bg-background hover:border-primary/20 hover:bg-accent/50",
							)}
						>
							<div className="mb-3 flex items-center space-x-3">
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
										"font-semibold text-base transition-colors",
										isActive
											? "text-primary"
											: "text-foreground group-hover:text-primary",
									)}
								>
									{item.label}
								</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{item.description}
							</p>
						</Link>
					);
				})}
			</nav>
		</>
	);
};

export const UserManagementNavbarSkeleton = () => {
	return (
		<>
			<div>
				<Skeleton className="mb-2 h-8 w-64" />
				<Skeleton className="h-5 w-96" />
			</div>

			<nav className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3">
				{[...Array(3)].map((_, i) => (
					<div
						key={i.toString()}
						className="group block rounded-lg border p-6 transition-all duration-200"
					>
						<div className="mb-3 flex items-center space-x-3">
							<Skeleton className="size-10 rounded-md" />
							<Skeleton className="h-6 w-48" />
						</div>
						<Skeleton className="h-4 w-full" />
						<Skeleton className="mt-1 h-4 w-3/4" />
					</div>
				))}
			</nav>
		</>
	);
};
