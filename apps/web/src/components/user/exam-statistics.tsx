import { useSuspenseQuery } from "@tanstack/react-query";
import { Calendar, Target, TrendingUp, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryUtils } from "@/utils/orpc";

function formatDate(date: Date | null) {
	if (!date) return "Never";
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(date));
}

export function ExamStatistics() {
	const { data: examStats } = useSuspenseQuery(
		queryUtils.user.getExamStats.queryOptions(),
	);

	return (
		<div className="mb-8">
			<h2 className="mb-6 font-bold text-2xl">Exam Statistics</h2>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Total Exams</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{examStats.totalExams}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Passed</CardTitle>
						<Trophy className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-green-600">
							{examStats.totalPassed}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Failed</CardTitle>
						<Target className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-red-600">
							{examStats.totalFailed}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Average Score</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{examStats.averageScore.toFixed(1)}%
						</div>
					</CardContent>
				</Card>
			</div>
			<div className="mt-4 grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Highest Score</CardTitle>
						<Trophy className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-yellow-600">
							{examStats.highestScore.toFixed(1)}%
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Last Attempt</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-medium text-lg">
							{formatDate(examStats.mostRecentAttempt)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export function ExamStatisticsSkeleton() {
	return (
		<div className="mb-8">
			<h2 className="mb-6 font-bold text-2xl">Exam Statistics</h2>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<Card key={i.toString()}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-24 rounded" />
							<Skeleton className="h-4 w-4 rounded-full" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-7 w-16 rounded" />
						</CardContent>
					</Card>
				))}
			</div>
			<div className="mt-4 grid gap-4 md:grid-cols-2">
				{[...Array(2)].map((_, i) => (
					<Card key={i.toString()}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-24 rounded" />
							<Skeleton className="h-4 w-4 rounded-full" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-7 w-20 rounded" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
