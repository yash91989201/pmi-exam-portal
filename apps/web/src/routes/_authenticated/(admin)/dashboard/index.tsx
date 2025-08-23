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

export const Route = createFileRoute("/_authenticated/(admin)/dashboard/")({
	component: RouteComponent,
});

function RouteComponent() {
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
					<MetricsCards />
				</Suspense>

				{/* Recent Activity */}
				<div>
					<Suspense fallback={<RecentActivitySkeleton />}>
						<RecentActivity />
					</Suspense>
				</div>

				{/* Charts Section */}
				<div className="grid gap-6 lg:grid-cols-2">
					{/* User Activity Charts */}
					<div className="lg:col-span-2">
						<Suspense fallback={<UserActivityChartsSkeleton />}>
							<UserActivityCharts />
						</Suspense>
					</div>

					{/* Exam Statistics */}
					<div className="lg:col-span-2">
						<Suspense fallback={<ExamStatsChartsSkeleton />}>
							<ExamStatsCharts />
						</Suspense>
					</div>
				</div>

				{/* Quick Actions */}
				<QuickActions />
			</div>
		</div>
	);
}
