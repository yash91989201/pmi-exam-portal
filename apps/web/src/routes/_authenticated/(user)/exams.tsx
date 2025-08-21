import type { ListUserExamsOutputType } from "@server-types/index";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ExternalLink, Loader2 } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/(user)/exams")({
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();
	const {
		data: { userExams = [] },
	} = useSuspenseQuery<ListUserExamsOutputType>(
		queryUtils.user.listExams.queryOptions(),
	);

	const { mutateAsync: createExamAttempt, isPending } = useMutation(
		queryUtils.user.createExamAttempt.mutationOptions(),
	);

	const handleAttemptExam = async ({
		examId,
		userExamId,
	}: {
		examId: string;
		userExamId: string;
	}) => {
		const mutationRes = await createExamAttempt({ userExamId });
		if (!mutationRes?.data) return;

		router.navigate({
			to: "/attempt-exam",
			search: {
				examId,
				examAttemptId: mutationRes.data.examAttemptId,
			},
		});
	};

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
							<Button
								onClick={() =>
									handleAttemptExam({
										examId: userExam.examId,
										userExamId: userExam.id,
									})
								}
							>
								{isPending ? (
									<Loader2 className="size-4.5 animate-spin" />
								) : (
									<ExternalLink className="size-4.5" />
								)}
								<span>Attempt Exam</span>
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
}
