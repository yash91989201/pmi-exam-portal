import { useSuspenseQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	ExternalLink,
	User,
	XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryUtils } from "@/utils/orpc";

const statusConfig = {
	completed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
	failed: { icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
	in_progress: {
		icon: AlertCircle,
		color: "text-yellow-600",
		bg: "bg-yellow-100",
	},
	abandoned: { icon: XCircle, color: "text-gray-600", bg: "bg-gray-100" },
};

export function RecentActivity() {
	const { data } = useSuspenseQuery(
		queryUtils.admin.getRecentActivity.queryOptions(),
	);
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						Recent Exam Attempts
						<Badge variant="secondary" className="text-xs">
							{data.recentAttempts.length} recent
						</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{data.recentAttempts.length === 0 ? (
						<p className="text-muted-foreground text-sm">No recent attempts</p>
					) : (
						data.recentAttempts.map((attempt) => {
							const StatusIcon =
								statusConfig[attempt.status as keyof typeof statusConfig]
									?.icon || AlertCircle;
							const statusStyle =
								statusConfig[attempt.status as keyof typeof statusConfig] ||
								statusConfig.in_progress;

							return (
								<div
									key={attempt.id}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div className="flex items-center gap-3">
										<div className={`rounded-full p-2 ${statusStyle.bg}`}>
											<StatusIcon className={`h-4 w-4 ${statusStyle.color}`} />
										</div>
										<div>
											<div className="font-medium text-sm">
												{attempt.userName || "Unknown User"}
											</div>
											<div className="text-muted-foreground text-xs">
												{attempt.examCertification}
											</div>
											<div className="text-muted-foreground text-xs">
												{attempt.completedAt
													? `Completed ${formatDistanceToNow(attempt.completedAt, { addSuffix: true })}`
													: "In progress"}
											</div>
										</div>
									</div>
									<div className="text-right">
										<div className="font-medium text-sm">
											{attempt.marks !== null ? `${attempt.marks}%` : "-"}
										</div>
										<Badge
											variant={
												attempt.status === "completed" ? "default" : "secondary"
											}
											className="text-xs"
										>
											{attempt.status}
										</Badge>
									</div>
								</div>
							);
						})
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Recent User Registrations
						<Badge variant="secondary" className="text-xs">
							{data.recentUsers.length} recent
						</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{data.recentUsers.length === 0 ? (
						<p className="text-muted-foreground text-sm">
							No recent registrations
						</p>
					) : (
						data.recentUsers.map((user) => (
							<div
								key={user.id}
								className="flex items-center justify-between rounded-lg border p-3"
							>
								<div className="flex items-center gap-3">
									<Avatar className="h-8 w-8">
										<AvatarFallback className="text-xs">
											{user.name
												?.split(" ")
												.map((n) => n[0])
												.join("") || user.email.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="font-medium text-sm">
											{user.name || "Unnamed User"}
										</div>
										<div className="text-muted-foreground text-xs">
											{user.email}
										</div>
									</div>
								</div>
								<div className="text-right">
									<div className="flex items-center gap-1 text-muted-foreground text-xs">
										<Calendar className="h-3 w-3" />
										{formatDistanceToNow(user.createdAt, { addSuffix: true })}
									</div>
									<Button variant="ghost" size="sm" className="mt-1 h-6">
										<ExternalLink className="h-3 w-3" />
									</Button>
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export function RecentActivitySkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			{Array.from({ length: 2 }).map((_, cardIndex) => (
				<Card key={cardIndex.toString()}>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Skeleton className="h-5 w-5" />
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-5 w-16 rounded-full" />
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{Array.from({ length: 5 }).map((_, itemIndex) => (
							<div
								key={itemIndex.toString()}
								className="flex items-center justify-between rounded-lg border p-3"
							>
								<div className="flex items-center gap-3">
									<Skeleton className="h-8 w-8 rounded-full" />
									<div className="space-y-1">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-3 w-32" />
										<Skeleton className="h-3 w-20" />
									</div>
								</div>
								<div className="space-y-1 text-right">
									<Skeleton className="h-4 w-12" />
									<Skeleton className="h-5 w-16 rounded-full" />
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
