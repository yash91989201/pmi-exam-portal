import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import {
	AvailableExams,
	AvailableExamsSkeleton,
} from "@/components/user/available-exams";
import {
	ExamStatistics,
	ExamStatisticsSkeleton,
} from "@/components/user/exam-statistics";

export const Route = createFileRoute("/_authenticated/(user)/exams")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto space-y-6 p-4">
			{/* Available Exams Section */}
			<Suspense fallback={<AvailableExamsSkeleton />}>
				<AvailableExams />
			</Suspense>

			{/* Exam Statistics Section - Suspense with loader */}
			<Suspense fallback={<ExamStatisticsSkeleton />}>
				<ExamStatistics />
			</Suspense>
		</div>
	);
}
