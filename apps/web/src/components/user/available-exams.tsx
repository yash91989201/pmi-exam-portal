import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
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
import { Skeleton } from "@/components/ui/skeleton";
import { queryUtils } from "@/utils/orpc";

export function AvailableExams() {
	const router = useRouter();
	const {
		data: { userExams = [] },
	} = useSuspenseQuery(queryUtils.user.listExams.queryOptions());

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
		<div>
			<h2 className="mb-4 font-bold text-2xl">Available Exams</h2>
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

export function AvailableExamsSkeleton() {
	return (
		<div>
			<h2 className="mb-4 font-bold text-2xl">Available Exams</h2>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{[...Array(3)].map((_, i) => (
					<Card key={i.toString()}>
						<CardHeader>
							<Skeleton className="mb-2 h-5 w-36 rounded" />
							<Skeleton className="h-4 w-28 rounded" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-4 w-24 rounded" />
						</CardContent>
						<CardFooter>
							<Skeleton className="h-9 w-32 rounded-full" />
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
}
