import { useForm } from "@tanstack/react-form";
import { Plus, Minus, Save, Eye, ArrowLeft, ArrowRight, Image as ImageIcon, CheckCircle, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
					<Card className="overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-slate-800/80">
						<div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
							<h2 className="text-xl font-semibold text-white">Exam Information</h2>
						</div>
						<div className="p-6">
							<form.Field name="certification">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor="certification" className="text-base font-medium">
											Certification Name *
										</Label>
										<Input
											id="certification"
											placeholder="e.g., PMP, CAPM, PMI-ACP"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											className={cn(
												"text-base transition-all",
												field.state.meta.errors?.length &&
													"border-destructive focus-visible:ring-destructive"
											)}
										/>
										{field.state.meta.errors?.length > 0 && (
											<p className="text-destructive text-sm">
												{field.state.meta.errors.join(", ")}
											</p>
										)}
									</div>
								)}
							</form.Field>

							<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="defaultMark" className="text-base font-medium">
										Default Mark per Question
									</Label>
									<Input
										id="defaultMark"
										type="number"
										min="1"
										max="10"
										value={defaultMark}
										onChange={(e) => setDefaultMark(Number(e.target.value) || 1)}
										className="text-base"
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-base font-medium">Estimated Duration</Label>
									<div className="flex items-center space-x-2 rounded-md border border-input px-3 py-2 text-base">
										<span className="text-muted-foreground">
											~{Math.ceil(questions.length * 1.5)} minutes
										</span>
									</div>
								</div>
							</div>
						</div>
					</Card>

					{/* Questions Management Section */}
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
						{/* Questions Navigation */}
						<div className="lg:col-span-1">
							<Card className="sticky top-6 border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-slate-800/80">
								<div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3">
									<h3 className="text-lg font-semibold text-white">Questions</h3>
								</div>
								<div className="p-4">
									<div className="mb-4">
										<Button
											type="button"
											onClick={addQuestion}
											className="w-full bg-green-600 hover:bg-green-700 text-white"
										>
											<Plus className="mr-2 h-4 w-4" />
											Add Question
										</Button>
									</div>
									
									<div className="max-h-[500px] overflow-y-auto space-y-2">
										{questions.map((question, index) => {
											const hasError = !question.text.trim() || 
												question.options.some(opt => !opt.text.trim()) ||
												getCorrectAnswersCount(index) === 0;
												
											return (
												<div
													key={index}
													className={cn(
														"relative rounded-lg border-2 border-transparent bg-slate-50 p-3 transition-all hover:bg-slate-100 cursor-pointer dark:bg-slate-700/50 dark:hover:bg-slate-700",
														selectedQuestionIndex === index && 
														"border-blue-500 bg-blue-50 dark:bg-blue-900/20",
														hasError && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
													)}
													onClick={() => setSelectedQuestionIndex(index)}
												>
													<div className="flex items-start justify-between">
														<div className="flex-1 min-w-0">
															<div className="flex items-center space-x-2">
																<span className="text-sm font-medium text-slate-900 dark:text-slate-100">
																	Q{index + 1}
																</span>
																<span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
																	{question.mark} mark{question.mark !== 1 ? 's' : ''}
																</span>
															</div>
															<p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
																{question.text || "New question..."}
															</p>
															<div className="mt-2 flex items-center space-x-2">
																<span className="text-xs text-slate-500">
																	{question.options.length} options
																</span>
																{getCorrectAnswersCount(index) > 0 && (
																	<CheckCircle className="h-3 w-3 text-green-600" />
																)}
																{hasError && (
																	<X className="h-3 w-3 text-red-600" />
																)}
															</div>
														</div>
														{questions.length > 1 && (
															<Button
																type="button"
																variant="ghost"
																size="sm"
																onClick={(e) => {
																	e.stopPropagation();
																	removeQuestion(index);
																}}
																className="h-6 w-6 p-0 text-slate-400 hover:text-red-600"
															>
																<X className="h-3 w-3" />
															</Button>
														)}
													</div>
												</div>
											);
										})}
									</div>
								</div>
							</Card>
						</div>

						{/* Question Editor */}
						<div className="lg:col-span-2">
							<Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-slate-800/80">
								<div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold text-white">
											Question {selectedQuestionIndex + 1} of {questions.length}
										</h3>
										<div className="flex items-center space-x-2">
											<Button
												type="button"
												variant="secondary"
												size="sm"
												onClick={() => 
													setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1))
												}
												disabled={selectedQuestionIndex === 0}
												className="bg-white/20 hover:bg-white/30 text-white border-white/20"
											>
												<ArrowLeft className="h-4 w-4" />
											</Button>
											<Button
												type="button"
												variant="secondary"
												size="sm"
												onClick={() => 
													setSelectedQuestionIndex(Math.min(questions.length - 1, selectedQuestionIndex + 1))
												}
												disabled={selectedQuestionIndex === questions.length - 1}
												className="bg-white/20 hover:bg-white/30 text-white border-white/20"
											>
												<ArrowRight className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>

								<div className="p-6 space-y-6">
									{/* Question Text */}
									<div className="space-y-3">
										<Label htmlFor={`question-${selectedQuestionIndex}`} className="text-base font-medium">
											Question Text *
										</Label>
										<textarea
											id={`question-${selectedQuestionIndex}`}
											placeholder="Enter your question here..."
											value={currentQuestion?.text || ""}
											onChange={(e) => updateQuestionText(selectedQuestionIndex, e.target.value)}
											className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-base transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
										/>
									</div>

									{/* Question Settings */}
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor={`mark-${selectedQuestionIndex}`} className="text-base font-medium">
												Marks *
											</Label>
											<Input
												id={`mark-${selectedQuestionIndex}`}
												type="number"
												min="1"
												max="10"
												value={currentQuestion?.mark || 1}
												onChange={(e) => updateQuestionMark(selectedQuestionIndex, Number(e.target.value))}
												className="text-base"
											/>
										</div>
										<div className="space-y-2">
											<Label className="text-base font-medium">Image (Optional)</Label>
											<div className="flex space-x-2">
												<Input
													placeholder="Image URL or ID"
													value={currentQuestion?.imageDriveId || ""}
													onChange={(e) => {
														const currentQuestions = form.getFieldValue("questions") || [];
														const updatedQuestions = [...currentQuestions];
														updatedQuestions[selectedQuestionIndex] = {
															...updatedQuestions[selectedQuestionIndex],
															imageDriveId: e.target.value,
														};
														form.setFieldValue("questions", updatedQuestions);
													}}
													className="text-base"
												/>
												<Button type="button" variant="outline" size="sm">
													<ImageIcon className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>

									{/* Answer Options */}
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<Label className="text-base font-medium">
												Answer Options * ({getCorrectAnswersCount(selectedQuestionIndex)} correct)
											</Label>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => addOption(selectedQuestionIndex)}
												disabled={currentQuestion?.options.length >= 6}
											>
												<Plus className="mr-2 h-3 w-3" />
												Add Option
											</Button>
										</div>

										<div className="space-y-3">
											{currentQuestion?.options.map((option, optionIndex) => (
												<div
													key={optionIndex}
													className={cn(
														"flex items-center space-x-3 rounded-lg border p-3 transition-all",
														option.isCorrect 
															? "border-green-500 bg-green-50 dark:bg-green-900/20" 
															: "border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700/50"
													)}
												>
													<Button
														type="button"
														variant={option.isCorrect ? "default" : "outline"}
														size="sm"
														onClick={() => toggleOptionCorrect(selectedQuestionIndex, optionIndex)}
														className={cn(
															"flex-shrink-0",
															option.isCorrect 
																? "bg-green-600 hover:bg-green-700 text-white" 
																: "hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
														)}
													>
														<CheckCircle className="h-4 w-4" />
													</Button>
													
													<div className="flex items-center flex-1 space-x-2">
														<span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0">
															{String.fromCharCode(65 + optionIndex)}.
														</span>
														<Input
															placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
															value={option.text}
															onChange={(e) => updateOptionText(selectedQuestionIndex, optionIndex, e.target.value)}
															className={cn(
																"text-base border-0 bg-transparent focus-visible:ring-0",
																option.isCorrect && "font-medium text-green-800 dark:text-green-200"
															)}
														/>
													</div>

													{currentQuestion.options.length > 2 && (
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => removeOption(selectedQuestionIndex, optionIndex)}
															className="flex-shrink-0 text-slate-400 hover:text-red-600"
														>
															<Minus className="h-4 w-4" />
														</Button>
													)}
												</div>
											))}
										</div>

										{getCorrectAnswersCount(selectedQuestionIndex) === 0 && (
											<p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-md p-2">
												⚠️ Please mark at least one option as correct
											</p>
										)}
									</div>
								</div>
							</Card>
						</div>
					</div>

					{/* Action Buttons */}
					<Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-slate-800/80">
						<div className="p-6">
							<form.Subscribe>
								{({ isSubmitting, canSubmit, errors }) => (
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-4">
											<Button
												type="button"
												variant="outline"
												onClick={() => {
													console.log("Preview exam:", form.state.values);
													toast.info("Preview functionality would open here");
												}}
											>
												<Eye className="mr-2 h-4 w-4" />
												Preview Exam
											</Button>
											
											{errors.length > 0 && (
												<div className="text-sm text-destructive">
													Please fix {errors.length} error{errors.length !== 1 ? 's' : ''} before submitting
												</div>
											)}
										</div>

										<Button
											type="submit"
											disabled={isSubmitting || !canSubmit}
											className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8"
										>
											{isSubmitting ? (
												<>
													<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
													Creating Exam...
												</>
											) : (
												<>
													<Save className="mr-2 h-4 w-4" />
													Create Exam
												</>
											)}
										</Button>
									</div>
								)}
							</form.Subscribe>
						</div>
					</Card>
				</form>
			</div>
		</div>
	);
}