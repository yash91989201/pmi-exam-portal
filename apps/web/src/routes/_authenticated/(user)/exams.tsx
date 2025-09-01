import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import {
	AvailableExams,
	AvailableExamsSkeleton,
} from "@/components/user/available-exams";

export const Route = createFileRoute("/_authenticated/(user)/exams")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto space-y-6 p-4">
			<Suspense fallback={<AvailableExamsSkeleton />}>
				<AvailableExams />
			</Suspense>
		</div>
	);
}
