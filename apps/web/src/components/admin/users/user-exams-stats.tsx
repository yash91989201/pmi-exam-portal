import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryUtils } from "@/utils/orpc";

export function UserExamsStats({ userId }: { userId: string }) {
	const { data } = useSuspenseQuery(
		queryUtils.admin.getUserExamStats.queryOptions({ input: { userId } }),
	);

	return (
		<section className="space-y-4">
			<h2 className="font-bold text-xl">User Exams Stats</h2>
			<div className="grid grid-cols-6 gap-3">
				<Card className="border-blue-200 bg-blue-50">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-blue-800 text-sm">
							Assigned Exams
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-blue-900">
							{data.totalAssignedExams}
						</div>
					</CardContent>
				</Card>
				<Card className="border-green-200 bg-green-50">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-green-800 text-sm">
							Completed Exams
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-green-900">
							{data.totalCompletedExams}
						</div>
					</CardContent>
				</Card>
				<Card className="border-yellow-200 bg-yellow-50">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm text-yellow-800">
							In-Progress Exams
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-yellow-900">
							{data.totalInProgressExams}
						</div>
					</CardContent>
				</Card>
				<Card className="border-red-200 bg-red-50">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-red-800 text-sm">
							Terminated Exams
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-red-900">
							{data.totalTerminatedExams}
						</div>
					</CardContent>
				</Card>
				<Card className="border-purple-200 bg-purple-50">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-purple-800 text-sm">
							Average Score
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-purple-900">
							{data.averageScore.toFixed(2)}%
						</div>
					</CardContent>
				</Card>
				<Card className="border-pink-200 bg-pink-50">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-pink-800 text-sm">
							Highest Score
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-pink-900">
							{data.highestScore}%
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}

export function UserExamsStatsSkeleton() {
  return (
    <section className="space-y-4">
      <h2 className="font-bold text-xl">User Exams Stats</h2>
      <div className="grid grid-cols-6 gap-3">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-blue-800 text-sm">
              Assigned Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-green-800 text-sm">
              Completed Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm text-yellow-800">
              In-Progress Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-red-800 text-sm">
              Terminated Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-purple-800 text-sm">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
        <Card className="border-pink-200 bg-pink-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-pink-800 text-sm">
              Highest Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
