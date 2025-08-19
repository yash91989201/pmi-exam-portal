import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { queryUtils } from "@/utils/orpc";
import type { ListUserExamsOutputType } from "@server-types/index";

export const Route = createFileRoute("/_authenticated/(user)/exams")({
	component: RouteComponent,
});

function RouteComponent() {
	const {
		data: { userExams = [] },
	} = useSuspenseQuery<ListUserExamsOutputType>(
		queryUtils.user.listExams.queryOptions(),
	);

	return (
		<div className="container mx-auto p-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{userExams.map((userExam) => (
					<Card key={userExam.id}>
						<CardHeader>
							<CardTitle>{userExam.exam.certification}</CardTitle>
							<CardDescription>
								{userExam.maxAttempts - userExam.attempts} attempt(s) remaining.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p>Time Limit: {userExam.exam.timeLimit} minutes</p>
						</CardContent>
						<CardFooter>
							<Link to="/attempt-exam" search={{ examId: userExam.exam.id }}>
								<Button>Start Exam</Button>
							</Link>
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
}
