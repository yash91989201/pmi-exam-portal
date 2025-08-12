import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { FormProvider } from "./form-context";
import { ExamInformation } from "./exam-information";
import { QuestionsList } from "./questions-list";
import { QuestionEditor } from "./question-editor";
import { ActionButtons } from "./action-buttons";

// Validation schemas
const OptionSchema = z.object({
	text: z.string().min(1, "Option text is required"),
	isCorrect: z.boolean().default(false),
});

const QuestionSchema = z.object({
	text: z.string().min(1, "Question text is required"),
	mark: z.number().min(1, "Mark must be at least 1"),
	imageDriveId: z.string().default(""),
	options: z.array(OptionSchema).min(2, "At least 2 options are required").max(6, "Maximum 6 options allowed"),
});

const ExamSchema = z.object({
	certification: z.string().min(1, "Certification name is required"),
	questions: z.array(QuestionSchema).min(1, "At least 1 question is required"),
});

interface Option {
	text: string;
	isCorrect: boolean;
}

interface Question {
	text: string;
	mark: number;
	imageDriveId: string;
	options: Option[];
}

interface ExamFormData {
	certification: string;
	questions: Question[];
}

export function CreateExamForm() {
	const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
	const [defaultMark, setDefaultMark] = useState<number>(1);

	const form = useForm({
		defaultValues: {
			certification: "",
			questions: [
				{
					text: "",
					mark: defaultMark,
					imageDriveId: "",
					options: [
						{ text: "", isCorrect: false },
						{ text: "", isCorrect: false },
					],
				},
			],
		},
		validators: {
			onSubmit: ({ value }) => {
				try {
					ExamSchema.parse(value);
				} catch (error) {
					if (error instanceof z.ZodError) {
						return error.format();
					}
					return "Validation error";
				}
			},
		},
		onSubmit: async ({ value }) => {
			try {
				// Calculate total marks
				const totalMarks = value.questions.reduce((sum, question) => sum + question.mark, 0);
				
				// Create exam data
				const examData = {
					certification: value.certification,
					mark: totalMarks,
					questions: value.questions.map((question, index) => ({
						...question,
						order: index + 1,
					})),
				};

				console.log("Submitting exam:", examData);
				toast.success("Exam created successfully!");
				
				// Here you would typically make an API call to save the exam
				// await createExam(examData);
			} catch (error) {
				console.error("Error creating exam:", error);
				toast.error("Failed to create exam. Please try again.");
			}
		},
	});

	const addQuestion = () => {
		const currentQuestions = form.getFieldValue("questions") || [];
		const newQuestion: Question = {
			text: "",
			mark: defaultMark,
			imageDriveId: "",
			options: [
				{ text: "", isCorrect: false },
				{ text: "", isCorrect: false },
			],
		};
		form.setFieldValue("questions", [...currentQuestions, newQuestion]);
		setSelectedQuestionIndex(currentQuestions.length);
	};

	const removeQuestion = (index: number) => {
		const currentQuestions = form.getFieldValue("questions") || [];
		if (currentQuestions.length <= 1) {
			toast.error("At least one question is required");
			return;
		}
		
		const updatedQuestions = currentQuestions.filter((_, i) => i !== index);
		form.setFieldValue("questions", updatedQuestions);
		
		// Adjust selected question index if necessary
		if (selectedQuestionIndex >= updatedQuestions.length) {
			setSelectedQuestionIndex(updatedQuestions.length - 1);
		} else if (selectedQuestionIndex > index) {
			setSelectedQuestionIndex(selectedQuestionIndex - 1);
		}
	};

	const addOption = (questionIndex: number) => {
		const currentQuestions = form.getFieldValue("questions") || [];
		const question = currentQuestions[questionIndex];
		
		if (question.options.length >= 6) {
			toast.error("Maximum 6 options allowed");
			return;
		}

		const updatedQuestions = [...currentQuestions];
		updatedQuestions[questionIndex] = {
			...question,
			options: [...question.options, { text: "", isCorrect: false }],
		};
		form.setFieldValue("questions", updatedQuestions);
	};

	const removeOption = (questionIndex: number, optionIndex: number) => {
		const currentQuestions = form.getFieldValue("questions") || [];
		const question = currentQuestions[questionIndex];
		
		if (question.options.length <= 2) {
			toast.error("At least 2 options are required");
			return;
		}

		const updatedQuestions = [...currentQuestions];
		updatedQuestions[questionIndex] = {
			...question,
			options: question.options.filter((_, i) => i !== optionIndex),
		};
		form.setFieldValue("questions", updatedQuestions);
	};

	const toggleOptionCorrect = (questionIndex: number, optionIndex: number) => {
		const currentQuestions = form.getFieldValue("questions") || [];
		const question = currentQuestions[questionIndex];
		
		const updatedQuestions = [...currentQuestions];
		updatedQuestions[questionIndex] = {
			...question,
			options: question.options.map((option, i) => ({
				...option,
				isCorrect: i === optionIndex ? !option.isCorrect : option.isCorrect,
			})),
		};
		form.setFieldValue("questions", updatedQuestions);
	};

	const updateQuestionText = (questionIndex: number, text: string) => {
		const currentQuestions = form.getFieldValue("questions") || [];
		const updatedQuestions = [...currentQuestions];
		updatedQuestions[questionIndex] = {
			...updatedQuestions[questionIndex],
			text,
		};
		form.setFieldValue("questions", updatedQuestions);
	};

	const updateQuestionMark = (questionIndex: number, mark: number) => {
		const currentQuestions = form.getFieldValue("questions") || [];
		const updatedQuestions = [...currentQuestions];
		updatedQuestions[questionIndex] = {
			...updatedQuestions[questionIndex],
			mark: mark || 1,
		};
		form.setFieldValue("questions", updatedQuestions);
	};

	const updateOptionText = (questionIndex: number, optionIndex: number, text: string) => {
		const currentQuestions = form.getFieldValue("questions") || [];
		const question = currentQuestions[questionIndex];
		
		const updatedQuestions = [...currentQuestions];
		updatedQuestions[questionIndex] = {
			...question,
			options: question.options.map((option, i) => 
				i === optionIndex ? { ...option, text } : option
			),
		};
		form.setFieldValue("questions", updatedQuestions);
	};

	const getTotalMarks = () => {
		const questions = form.getFieldValue("questions") || [];
		return questions.reduce((sum, question) => sum + (question.mark || 0), 0);
	};

	const getCorrectAnswersCount = (questionIndex: number) => {
		const questions = form.getFieldValue("questions") || [];
		const question = questions[questionIndex];
		return question?.options.filter(option => option.isCorrect).length || 0;
	};

	const questions = form.getFieldValue("questions") || [];
	const currentQuestion = questions[selectedQuestionIndex];

	return (
		<FormProvider value={form}>
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
				<div className="mx-auto max-w-7xl">
					{/* Header */}
					<div className="mb-8">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
									Create New Exam
								</h1>
								<p className="mt-2 text-slate-600 dark:text-slate-400">
									Build your PMI certification exam with questions and answers
								</p>
							</div>
							<div className="flex items-center space-x-3">
								<div className="text-right">
									<div className="text-sm font-medium text-slate-600 dark:text-slate-400">
										Total Questions
									</div>
									<div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
										{questions.length}
									</div>
								</div>
								<div className="h-8 w-px bg-slate-300 dark:bg-slate-600" />
								<div className="text-right">
									<div className="text-sm font-medium text-slate-600 dark:text-slate-400">
										Total Marks
									</div>
									<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
										{getTotalMarks()}
									</div>
								</div>
							</div>
						</div>
					</div>

					<form
						className="space-y-8"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						{/* Exam Information Section */}
						<ExamInformation 
							defaultMark={defaultMark}
							setDefaultMark={setDefaultMark}
							questionsLength={questions.length}
						/>

						{/* Questions Management Section */}
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
							{/* Questions Navigation */}
							<div className="lg:col-span-1">
								<QuestionsList
									selectedQuestionIndex={selectedQuestionIndex}
									setSelectedQuestionIndex={setSelectedQuestionIndex}
									addQuestion={addQuestion}
									removeQuestion={removeQuestion}
									getCorrectAnswersCount={getCorrectAnswersCount}
								/>
							</div>

							{/* Question Editor */}
							<div className="lg:col-span-2">
								<QuestionEditor
									selectedQuestionIndex={selectedQuestionIndex}
									setSelectedQuestionIndex={setSelectedQuestionIndex}
									questionsLength={questions.length}
									currentQuestion={currentQuestion}
									updateQuestionText={updateQuestionText}
									updateQuestionMark={updateQuestionMark}
									addOption={addOption}
									removeOption={removeOption}
									toggleOptionCorrect={toggleOptionCorrect}
									updateOptionText={updateOptionText}
									getCorrectAnswersCount={getCorrectAnswersCount}
								/>
							</div>
						</div>

						{/* Action Buttons */}
						<ActionButtons />
					</form>
				</div>
			</div>
		</FormProvider>
	);
}