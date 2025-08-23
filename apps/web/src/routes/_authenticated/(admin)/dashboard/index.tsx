import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import {
	ExamStatsCharts,
	ExamStatsChartsSkeleton,
} from "@/components/admin/dashboard/exam-stats-charts";
import {
	MetricsCards,
	MetricsCardsSkeleton,
} from "@/components/admin/dashboard/metrics-cards";
import { QuickActions } from "@/components/admin/dashboard/quick-actions";
import {
	RecentActivity,
	RecentActivitySkeleton,
} from "@/components/admin/dashboard/recent-activity";
import {
	UserActivityCharts,
	UserActivityChartsSkeleton,
} from "@/components/admin/dashboard/user-activity-charts";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/(admin)/dashboard/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: dashboardStats } = useSuspenseQuery(
		queryUtils.admin.getDashboardStats.queryOptions(),
	);
	//
	const { data: recentActivity } = useSuspenseQuery(
		queryUtils.admin.getRecentActivity.queryOptions(),
	);
	//
	const { data: examStats } = useSuspenseQuery(
		queryUtils.admin.getExamStats.queryOptions(),
	);

	const { data: userActivity } = useSuspenseQuery(
		queryUtils.admin.getUserActivity.queryOptions(),
	);

	return (
		<div className="flex-1 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground">
						Overview of your PMI exam portal performance and statistics.
					</p>
				</div>
			</div>

			{/* Metrics Cards */}
			<div className="space-y-6">
				<Suspense fallback={<MetricsCardsSkeleton />}>
					<MetricsCards data={dashboardStats} />
				</Suspense>

				{/* Recent Activity */}
				<div>
					<Suspense fallback={<RecentActivitySkeleton />}>
						<RecentActivity data={recentActivity} />
					</Suspense>
				</div>

				{/* Charts Section */}
				<div className="grid gap-6 lg:grid-cols-2">
					{/* User Activity Charts */}
					<div className="lg:col-span-2">
						<Suspense fallback={<UserActivityChartsSkeleton />}>
							<UserActivityCharts data={userActivity} />
						</Suspense>
					</div>

					{/* Exam Statistics */}
					<div className="lg:col-span-2">
						<Suspense fallback={<ExamStatsChartsSkeleton />}>
							<ExamStatsCharts data={examStats} />
						</Suspense>
					</div>
				</div>

				{/* Quick Actions */}
				<QuickActions />
			</div>
		</div>
	);
}
