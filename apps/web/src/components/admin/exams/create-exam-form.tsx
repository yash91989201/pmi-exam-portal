import { createId } from "@paralleldrive/cuid2";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { formContext } from "@/lib/form-context";
import { type ExamFormData, ExamFormSchema } from "@/lib/schema/exam";
import { orpcClient } from "@/utils/orpc";
import { BasicInformation } from "./BasicInformation";
import { FormSubmitButton } from "./FormSubmitButton";
import { QuestionsSection } from "./QuestionsSection";

export function CreateExamForm() {
	const router = useRouter();
	const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
	const [defaultMark, setDefaultMark] = useState(1); // default mark selection

	const form = useForm({
		defaultValues: {
			id: createId(),
			certification: "",
			mark: 0,
			questions: [
				{
					id: createId(),
					text: "",
					mark: defaultMark, // use defaultMark
					order: 0,
					options: [
						{ id: createId(), text: "", isCorrect: true, order: 0 },
						{ id: createId(), text: "", isCorrect: false, order: 1 },
					],
				},
			],
		} as ExamFormData,
		validators: {
			onSubmit: ExamFormSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const response = await orpcClient.exam.createExam(value);

				if (response.success) {
					toast.success(response.message || "Exam created successfully!");
					router.navigate({
						to: "/dashboard",
					});
				} else {
					toast.error(response.message || "Failed to create exam");
				}
			} catch (error) {
				console.error("Error creating exam:", error);
				toast.error("Failed to create exam. Please try again.");
			}
		},
	});

	return (
		<formContext.Provider value={form}>
			<div className="mx-auto space-y-8 pb-8">
				<form
					className="space-y-8"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					{/* Basic Information Tab */}
					<BasicInformation />

					{/* Questions Section */}
					<QuestionsSection
						selectedQuestionIndex={selectedQuestionIndex}
						setSelectedQuestionIndex={setSelectedQuestionIndex}
						defaultMark={defaultMark}
						setDefaultMark={setDefaultMark}
					/>

					{/* Submit Button */}
					<FormSubmitButton />
				</form>
			</div>
		</formContext.Provider>
	);
}
