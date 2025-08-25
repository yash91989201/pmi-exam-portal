import { createFileRoute, notFound } from "@tanstack/react-router";
import { Suspense } from "react";
import { z } from "zod";
import {
	AttemptExamForm,
	AttemptExamFormSkeleton,
} from "@/components/user/attempt-exam-form";
import { authClient } from "@/lib/auth-client";

const RouteSearchSchema = z.object({
	examId: z.cuid2(),
	examAttemptId: z.cuid2(),
});

export const Route = createFileRoute(
	"/_authenticated/(user-exam)/attempt-exam",
)({
	validateSearch: RouteSearchSchema,
	loader: async ({
		context: { orpcClient, queryClient, queryUtils },
		location,
	}) => {
		const { examId, examAttemptId } = location.search as z.infer<
			typeof RouteSearchSchema
		>;

		const { data: sessionData, error } = await authClient.getSession();

		if (error) {
			throw new Error(error.message);
		}

		const isImpersonating =
			typeof sessionData?.session?.impersonatedBy === "string";

		const { data: examAttemptStatusData } =
			await orpcClient.user.getExamAttemptStatus({
				examAttemptId: examAttemptId,
			});

		const examAttemptStatus = examAttemptStatusData?.status;

		const allowExamAttempt =
			typeof examAttemptStatus === "string" &&
			(examAttemptStatus === "started" || examAttemptStatus === "in_progress");

		if (allowExamAttempt) {
			queryClient.prefetchQuery(
				queryUtils.user.getExamForAttempt.queryOptions({
					input: { examId, examAttemptId },
				}),
			);
		}

		return {
			isImpersonating,
			allowExamAttempt,
		};
	},
	component: RouteComponent,
	onLeave: async ({
		context: { orpcClient, queryClient, queryUtils },
		search,
	}) => {
		const { data: examAttemptStatusData } =
			await orpcClient.user.getExamAttemptStatus({
				examAttemptId: search.examAttemptId,
			});
		if (examAttemptStatusData?.status === undefined) {
			return;
		}

		const examAttemptStatus = examAttemptStatusData.status;

		if (
			examAttemptStatus === "in_progress" ||
			examAttemptStatus === "started"
		) {
			await orpcClient.user.terminateExam({
				examId: search.examId,
				examAttemptId: search.examAttemptId,
				reason: "User navigated within the app.",
			});

			queryClient.invalidateQueries({
				queryKey: queryUtils.user.key(),
			});
		}
	},
});

function RouteComponent() {
	const { examId, examAttemptId } = Route.useSearch();
	const { isImpersonating, allowExamAttempt } = Route.useLoaderData();

	if (!allowExamAttempt) {
		throw notFound();
	}

	return (
		<Suspense fallback={<AttemptExamFormSkeleton />}>
			<AttemptExamForm
				examId={examId}
				examAttemptId={examAttemptId}
				isImpersonating={isImpersonating}
			/>
		</Suspense>
	);
}
