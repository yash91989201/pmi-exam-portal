import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";

export const UserOrders = () => {
	const {
		data: { userOrders },
	} = useSuspenseQuery(queryUtils.user.listOrders.queryOptions({}));

	return (
		<div className="space-y-6">
			{userOrders.map(({ orderId, isCompleted, orderText }, index) => {
				const isLastItem = index === userOrders.length - 1;
				const isFirstItem = index === 0;

				let statusIcon: React.ReactNode;
				let statusBadge: React.ReactNode;
				let statusTextColor: string;

				if (isCompleted) {
					statusIcon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
					statusBadge = (
						<Badge className="bg-green-500 text-white hover:bg-green-500/90">
							Completed
						</Badge>
					);
					statusTextColor = "text-foreground";
				} else if (isFirstItem || userOrders[index - 1]?.isCompleted) {
					statusIcon = <Circle className="h-5 w-5 text-primary" />;
					statusBadge = <Badge variant="default">In Progress</Badge>;
					statusTextColor = "text-foreground";
				} else {
					statusIcon = <XCircle className="h-5 w-5 text-muted-foreground" />;
					statusBadge = <Badge variant="secondary">Pending</Badge>;
					statusTextColor = "text-muted-foreground";
				}

				return (
					<div key={orderId} className="flex">
						<div className="mr-4 flex flex-col items-center">
							<div>{statusIcon}</div>
							{!isLastItem && (
								<div className="h-full min-h-[4rem] w-px bg-border" />
							)}
						</div>
						<div className="flex-1">
							<div className="flex items-center justify-between">
								<p className={cn("font-semibold", statusTextColor)}>
									{orderText}
								</p>
								{statusBadge}
							</div>
							<p className="mt-1 text-muted-foreground text-sm">
								Status updated on: August 23, 2025
							</p>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export const UserOrdersSkeleton = () => {
	const skeletonItems = Array.from({ length: 5 });
	return (
		<div className="space-y-6">
			{skeletonItems.map((_, index) => (
				<div key={index.toString()} className="flex">
					<div className="mr-4 flex flex-col items-center">
						<div>
							<Skeleton className="h-5 w-5 rounded-full" />
						</div>
						{index < skeletonItems.length - 1 && (
							<div className="h-full min-h-[4rem] w-px bg-border" />
						)}
					</div>
					<div className="flex-1">
						<div className="flex items-center justify-between">
							<Skeleton className="h-5 w-1/2" />
							<Skeleton className="h-6 w-20 rounded-full" />
						</div>
						<Skeleton className="mt-2 h-4 w-1/3" />
					</div>
				</div>
			))}
		</div>
	);
};
