import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/(user)/exams")({
	component: RouteComponent,
});

function RouteComponent() {
	const {
		data: { userExams = [] },
	} = useSuspenseQuery(queryUtils.user.listExams.queryOptions());

	return <div>{userExams.map((userExam) => userExam.exam.certification)}</div>;
}
