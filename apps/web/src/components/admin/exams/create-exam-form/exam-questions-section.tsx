import { CheckCircle2, HelpCircle, Minus, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { ExamFormSchemaType } from "@/lib/schema/exam";
import { cn } from "@/lib/utils";
import { ExcelUpload } from "./excel-upload";

export const ExamQuestionsSection = () => {
	const form = useFormContext<ExamFormSchemaType>();
	const defaultMark = form.watch("formState.defaultMarks");
	const selectedQuestionIndex = form.watch("formState.selectedQuestionIndex");

	const {
		fields: questionFields,
		append,
		remove,
	} = useFieldArray({
		control: form.control,
		name: "questions",
	});

	const addQuestion = () => {
		const newQuestion = {
			text: "",
			mark: defaultMark,
			order: questionFields.length,
			options: [
				{ text: "", isCorrect: true, order: 0 },
				{ text: "", isCorrect: false, order: 1 },
			],
		};

		append(newQuestion);
		form.setValue("formState.selectedQuestionIndex", questionFields.length);
	};

	const removeQuestion = (index: number) => {
		if (questionFields.length < 2) {
			return;
		}

		remove(index);

		const questions = form.getValues("questions");
		const updatedQuestions = questions.filter((_, i) => i !== index);

		updatedQuestions.forEach((q, i) => {
			q.order = i;
		});

		form.setValue("questions", updatedQuestions);
		form.setValue(
			"formState.selectedQuestionIndex",
			Math.min(index, updatedQuestions.length - 1),
		);
	};

	const handleQuestionSelect = (index: number) => {
		form.setValue("formState.selectedQuestionIndex", index);
	};

	return (
		<Card className="border-0 bg-gradient-to-br from-background to-muted/30 shadow-lg">
			<CardHeader className="pb-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-md">
							<HelpCircle className="h-6 w-6 text-white" />
						</div>
						<div>
							<CardTitle className="font-bold text-2xl">
								Exam Questions
							</CardTitle>
							<p className="mt-2 text-muted-foreground">
								Create comprehensive questions for your certification exam
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<ExcelUpload />
						<Button
							type="button"
							size="lg"
							onClick={addQuestion}
							className="shadow-md transition-all hover:shadow-lg"
						>
							<Plus className="mr-2 h-4 w-4" />
							Add Question
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{questionFields.length === 0 ? (
						<div className="py-16 text-center text-muted-foreground">
							<div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 p-6">
								<HelpCircle className="h-12 w-12 opacity-50" />
							</div>
							<p className="mb-2 font-semibold text-xl">No questions yet</p>
							<p className="text-base">Click "Add Question" to get started</p>
						</div>
					) : (
						<div className="flex flex-row gap-6">
							<ScrollArea className="h-[80vh] w-80">
								<div className="flex h-fit w-full flex-col rounded-md bg-white p-1">
									{questionFields.map((question, index) => {
										const watchedQuestion = form.watch(`questions.${index}`);
										const isComplete =
											watchedQuestion.text?.trim() &&
											watchedQuestion.mark > 0 &&
											watchedQuestion.options?.length >= 2 &&
											watchedQuestion.options.every(
												(opt) => opt.text?.trim()?.length >= 3,
											) &&
											watchedQuestion.options.some((opt) => opt.isCorrect);

										// Get first few words of the question text
										const questionPreview = watchedQuestion.text
											? watchedQuestion.text
													.trim()
													.split(" ")
													.slice(0, 4)
													.join(" ") +
												(watchedQuestion.text.trim().split(" ").length > 4
													? "..."
													: "")
											: `Question ${index + 1}`;

										return (
											<Button
												key={question.id}
												type="button"
												variant={
													selectedQuestionIndex === index
														? "secondary"
														: "outline"
												}
												className="mb-3 h-auto w-full justify-start px-3 py-4"
												onClick={() => handleQuestionSelect(index)}
											>
												<div className="flex w-full items-start gap-3">
													<div
														className={cn(
															"flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md font-bold text-xs",
															selectedQuestionIndex === index
																? "bg-white text-primary"
																: "bg-primary text-white",
														)}
													>
														Q{index + 1}
													</div>
													<div className="min-w-0 flex-1 text-left">
														<div className="truncate font-medium text-sm">
															{questionPreview}
														</div>
													</div>
													{isComplete ? (
														<CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
													) : (
														<Badge className="rounded-xl">Draft</Badge>
													)}
												</div>
											</Button>
										);
									})}
								</div>
							</ScrollArea>

							<div className="flex-1">
								{questionFields.map((question, index) => (
									<div
										key={question.id}
										className={
											selectedQuestionIndex === index ? "block" : "hidden"
										}
									>
										<QuestionEditor
											questionIndex={index}
											removeQuestion={removeQuestion}
										/>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

// QuestionEditor Component
export const QuestionEditor = ({
	questionIndex,
	removeQuestion,
}: {
	questionIndex: number;
	removeQuestion: (index: number) => void;
}) => {
	const form = useFormContext<ExamFormSchemaType>();

	const {
		fields: optionFields,
		append: appendOption,
		remove: removeOption,
	} = useFieldArray({
		control: form.control,
		name: `questions.${questionIndex}.options`,
	});

	const addOption = () => {
		appendOption({
			text: "",
			isCorrect: false,
			order: optionFields.length,
		});
	};

	const handleCorrectOptionChange = (
		optionIndex: number,
		isCorrect: boolean,
	) => {
		if (isCorrect) {
			// Set all other options to false
			optionFields.forEach((_, index) => {
				form.setValue(
					`questions.${questionIndex}.options.${index}.isCorrect`,
					index === optionIndex,
				);
			});
		} else {
			form.setValue(
				`questions.${questionIndex}.options.${optionIndex}.isCorrect`,
				false,
			);
		}
	};

	return (
		<Card className="border border-muted-foreground/20">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => removeQuestion(questionIndex)}
					className="text-destructive hover:text-destructive"
					disabled={form.watch("questions").length <= 1}
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</CardHeader>
			<CardContent className="space-y-6">
				<FormField
					control={form.control}
					name={`questions.${questionIndex}.text`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Question Text</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									placeholder="Enter your question here..."
									rows={4}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Question Mark */}
				<FormField
					control={form.control}
					name={`questions.${questionIndex}.mark`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Marks</FormLabel>
							<FormControl>
								<div className="flex items-center gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => field.onChange(Math.max(1, field.value - 1))}
										disabled={field.value <= 1}
									>
										<Minus className="h-4 w-4" />
									</Button>
									<Input
										{...field}
										type="number"
										min="1"
										max="25"
										className="w-20 text-center"
										onChange={(e) => {
											const value = Math.max(
												1,
												Math.min(25, Number.parseInt(e.target.value, 10) || 1),
											);
											field.onChange(value);
										}}
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() =>
											field.onChange(Math.min(25, field.value + 1))
										}
										disabled={field.value >= 25}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Options */}
				<div className="space-y-4">
					<FormLabel>Answer Options</FormLabel>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						{optionFields.map((option, optionIndex) => {
							const isCorrect = form.watch(
								`questions.${questionIndex}.options.${optionIndex}.isCorrect`,
							);
							const optionLabel = String.fromCharCode(65 + optionIndex); // A, B, C, D, etc.

							return (
								// biome-ignore lint/a11y/useSemanticElements: <div is required here with button role>
								<div
									key={option.id}
									className={cn(
										"group relative flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all duration-200",
										isCorrect
											? "border-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-md ring-1 ring-green-200"
											: "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm",
									)}
									onClick={() => handleCorrectOptionChange(optionIndex, true)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											handleCorrectOptionChange(optionIndex, true);
										}
									}}
									role="button"
									tabIndex={0}
									aria-label={`Mark option ${optionLabel} as correct answer`}
								>
									{/* Custom Radio Button */}
									<div className="flex items-center gap-4">
										<FormField
											control={form.control}
											name={`questions.${questionIndex}.options.${optionIndex}.isCorrect`}
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<div className="relative">
															<input
																type="radio"
																name={`question-${questionIndex}-correct`}
																checked={field.value}
																onChange={() =>
																	handleCorrectOptionChange(optionIndex, true)
																}
																className="sr-only"
																aria-label={`Mark option ${optionLabel} as correct answer`}
															/>
															<div
																className={cn(
																	"relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-200",
																	field.value
																		? "scale-110 border-green-500 bg-green-500 shadow-md"
																		: "border-gray-300 bg-white group-hover:border-blue-400 group-hover:bg-blue-50",
																)}
															>
																{field.value && (
																	<div className="zoom-in-50 h-2.5 w-2.5 animate-in rounded-full bg-white duration-200" />
																)}
																{/* Ripple effect on selection */}
																{field.value && (
																	<div className="absolute inset-0 animate-ping rounded-full bg-green-500 opacity-20" />
																)}
															</div>
														</div>
													</FormControl>
												</FormItem>
											)}
										/>

										{/* Option Label Badge */}
										<div
											className={cn(
												"flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm shadow-sm transition-all duration-200",
												isCorrect
													? "scale-105 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-200"
													: "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-700",
											)}
										>
											{optionLabel}
										</div>
									</div>

									{/* Option Text Input */}
									<FormField
										control={form.control}
										name={`questions.${questionIndex}.options.${optionIndex}.text`}
										render={({ field }) => (
											<FormItem className="flex-1">
												<FormControl>
													<Input
														{...field}
														placeholder={`Enter option ${optionLabel}...`}
														className={cn(
															"border-0 bg-transparent text-base transition-all duration-200 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500",
															isCorrect
																? "font-semibold text-green-800 placeholder:text-green-400"
																: "font-medium text-gray-700 group-hover:text-gray-800",
														)}
														onClick={(e) => e.stopPropagation()}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Delete Option Button */}
									{optionFields.length > 2 && (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												removeOption(optionIndex);
											}}
											className={cn(
												"rounded-full p-3 opacity-0 transition-all duration-200 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100",
												isCorrect && "opacity-100 hover:bg-red-100",
											)}
											aria-label={`Delete option ${optionLabel}`}
										>
											<Trash2 className="size-4.5" />
										</Button>
									)}
								</div>
							);
						})}

						{optionFields.length < 6 && (
							<div className="mt-6">
								<Button
									type="button"
									variant="outline"
									size="lg"
									onClick={addOption}
									className="group flex w-full items-center justify-center border-2 border-gray-300 border-dashed py-8 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50"
								>
									<Plus className="mr-2 h-5 w-5 text-gray-600 group-hover:text-blue-700" />
									<span className="font-semibold text-base text-gray-600 transition-colors duration-200 group-hover:text-blue-700">
										Add Option {String.fromCharCode(65 + optionFields.length)}
									</span>
								</Button>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
