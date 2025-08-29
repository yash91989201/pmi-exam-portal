import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { createId } from "@paralleldrive/cuid2";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import type { CreateExamFormSchemaType } from "@/lib/schema/exam";
import { CreateExamFormSchema } from "@/lib/schema/exam";
import { queryClient, queryUtils } from "@/utils/orpc";
import { ExamDetailsCard } from "./exam-details-card";
import { ExamQuestionsSection } from "./exam-questions-section";

export const CreateExamForm = () => {
	const router = useRouter();

	const form = useForm<CreateExamFormSchemaType>({
		resolver: standardSchemaResolver(CreateExamFormSchema),
		defaultValues: {
			certification: "",
			mark: 0,
			timeLimit: 60,
			questions: [
				{
					text: "",
					mark: 1,
					order: 0,
					options: [
						{ text: "", isCorrect: true, order: 0 },
						{ text: "", isCorrect: false, order: 1 },
					],
				},
			],
			formState: {
				defaultMarks: 1,
				selectedQuestionIndex: 0,
			},
		},
	});

	const { mutateAsync: createExamMutation } = useMutation(
		queryUtils.admin.createExam.mutationOptions({
			onSettled: async () => {
				queryClient.invalidateQueries(
					queryUtils.admin.listExams.queryOptions({
						input: {},
					}),
				);
			},
		}),
	);

	const onSubmit: SubmitHandler<CreateExamFormSchemaType> = async ({
		formState: _,
		...formData
	}) => {
		try {
			const examId = createId();
			const mutationInput = {
				id: examId,
				...formData,
				mark: formData.questions.reduce(
					(total, question) => total + question.mark,
					0,
				),
				questions: formData.questions.map((question) => {
					const questionId = createId();

					return {
						id: questionId,
						...question,
						options: question.options.map((option) => ({
							id: createId(),
							...option,
							questionId,
						})),
						examId,
					};
				}),
			};

			const mutationRes = await createExamMutation(mutationInput);

			if (mutationRes.success) {
				toast.success(mutationRes.message || "Exam created successfully!");
				router.navigate({ to: "/dashboard/exams" });
			} else {
				toast.error(mutationRes.message || "Failed to create exam");
			}
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to create exam. Please try again.",
			);
		}
	};

	return (
		<Form {...form}>
			<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
				<ExamDetailsCard />
				<ExamQuestionsSection />
			</form>
		</Form>
	);
};
