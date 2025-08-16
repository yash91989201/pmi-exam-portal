import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { ExamFormSchema, type ExamFormSchemaType } from "@/lib/schema/exam";
import { orpcClient } from "@/utils/orpc";
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

	const onSubmit = async (data: ExamFormSchemaType) => {
		try {
			const totalMarks = data.questions.reduce(
				(total, question) => total + (question.mark || 0),
				0,
			);

			const examData = { ...data, mark: totalMarks };
			examData.timeLimit = Math.max(1, Math.floor(examData.timeLimit ?? 60));

			const response = await orpcClient.exam.createExam(examData);

			if (response.success) {
				toast.success(response.message || "Exam created successfully!");
				router.navigate({ to: "/dashboard/exams" });
			} else {
				toast.error(response.message || "Failed to create exam");
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
