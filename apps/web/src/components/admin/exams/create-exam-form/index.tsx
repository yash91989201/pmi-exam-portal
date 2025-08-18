import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { ExamFormSchema, type ExamFormSchemaType } from "@/lib/schema/exam";
import { queryClient, queryUtils } from "@/utils/orpc";
import { ExamInfoCard } from "./exam-info-card";
import { ExamQuestionsSection } from "./exam-questions-section";

export const CreateExamForm = () => {
	const router = useRouter();

	const form = useForm<ExamFormSchemaType>({
		resolver: standardSchemaResolver(ExamFormSchema),
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
		queryUtils.exam.createExam.mutationOptions({
			onSettled: async () => {
				queryClient.invalidateQueries(
					queryUtils.exam.listExams.queryOptions({
						input: {},
					}),
				);
			},
		}),
	);

	const onSubmit: SubmitHandler<ExamFormSchemaType> = async ({
		formState: _,
		...formData
	}) => {
		try {
			const mutationRes = await createExamMutation({
				...formData,
				mark: formData.questions.reduce(
					(total, question) => total + question.mark,
					0,
				),
			});

			if (mutationRes.success) {
				toast.success(mutationRes.message || "Exam created successfully!");
				router.navigate({ to: "/dashboard/exams" });
			} else {
				toast.error(mutationRes.message || "Failed to create exam");
			}
		} catch (error) {
			console.error("Error creating exam:", error);
			toast.error("Failed to create exam. Please try again.");
		}
	};

	return (
		<Form {...form}>
			<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
				<ExamInfoCard />
				<ExamQuestionsSection />
			</form>
		</Form>
	);
};
