import { createId } from "@paralleldrive/cuid2";
import { useRouter } from "@tanstack/react-router";
import {
	Check,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Hash,
	HelpCircle,
	Minus,
	Plus,
	Target,
	Trash2,
	Trophy,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAppForm } from "@/components/ui/tanstack-form";
import { Textarea } from "@/components/ui/textarea";
import { type ExamFormData, ExamFormSchema } from "@/lib/schema/exam";
import { cn } from "@/lib/utils";
import { orpcClient } from "@/utils/orpc";

export function CreateExamForm() {
	const router = useRouter();
	const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
	const [defaultMark, setDefaultMark] = useState(1); // default mark selection

	const form = useAppForm({
		validators: {
			onSubmit: ExamFormSchema,
		},
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
		onSubmit: async ({ value }) => {
			try {
				// Calculate total marks before submitting
				const totalMarks = value.questions.reduce(
					(total, question) => total + (question.mark || 0),
					0,
				);

				const examData = { ...value, mark: totalMarks };

				const response = await orpcClient.exam.createExam(examData);

				if (response.success) {
					toast.success(response.message || "Exam created successfully!");
					router.navigate({
						to: "/dashboard/exams",
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

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			e.stopPropagation();
			form.handleSubmit();
		},
		[form],
	);

	return (
		<form.AppForm>
			<div className="mx-auto space-y-8 pb-8">
				<form className="space-y-8" onSubmit={handleSubmit}>
					{/* Basic Information Tab */}
					<Card className="border-0 bg-gradient-to-br from-background to-muted/30 shadow-lg">
						<CardHeader className="pb-6">
							<div className="flex items-center gap-4">
								<div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-3 shadow-md">
									<Target className="h-6 w-6 text-primary-foreground" />
								</div>
								<div>
									<CardTitle className="font-bold text-2xl">
										Exam Information
									</CardTitle>
									<p className="mt-2 text-muted-foreground">
										Set up the basic details for your PMI certification exam
									</p>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-8">
							<form.AppField name="certification">
								{(field) => (
									<field.FormItem>
										<field.FormLabel>Certification Name</field.FormLabel>
										<field.FormControl>
											<Input
												id="certification"
												placeholder="e.g., Project Management Professional (PMP)"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												required
												autoFocus
											/>
										</field.FormControl>
										<field.FormDescription>
											Set up the basic details for your PMI certification exam
										</field.FormDescription>
										<field.FormMessage />
									</field.FormItem>
								)}
							</form.AppField>

							<form.Subscribe selector={(state) => state.values.questions}>
								{(questions) => {
									const totalMarks = questions.reduce(
										(total, question) => total + (question.mark || 0),
										0,
									);
									return (
										<div className="space-y-2">
											<Label className="font-medium text-sm">Total Marks</Label>
											<div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
												<Trophy className="h-5 w-5 text-primary" />
												<span className="font-bold text-lg">{totalMarks}</span>
												<span className="text-muted-foreground">
													mark{totalMarks !== 1 ? "s" : ""}
												</span>
											</div>
											<p className="text-muted-foreground text-sm">
												Total marks are automatically calculated from all
												questions
											</p>
										</div>
									);
								}}
							</form.Subscribe>
						</CardContent>
					</Card>

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
								<form.AppField name="questions">
									{(field) => (
										<div className="flex items-center gap-4">
											<Label
												htmlFor="default-mark"
												className="mr-2 font-semibold text-base"
											>
												Default Marks
											</Label>
											<Select
												value={defaultMark.toString()}
												onValueChange={(v) => setDefaultMark(Number(v))}
											>
												<SelectTrigger className="w-32 rounded-md border px-2 py-1 font-medium text-base">
													{defaultMark}
												</SelectTrigger>
												<SelectContent>
													{[1, 2, 3, 4, 5, 10, 15, 20, 25].map((val) => (
														<SelectItem key={val} value={val.toString()}>
															{val}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<Button
												type="button"
												size="lg"
												onClick={() => {
													const newQuestion = {
														id: createId(),
														text: "",
														mark: defaultMark, // use selected defaultMark
														order: field.state.value.length,
														options: [
															{
																id: createId(),
																text: "",
																isCorrect: false,
																order: 0,
															},
															{
																id: createId(),
																text: "",
																isCorrect: false,
																order: 1,
															},
														],
													};
													const newQuestions = [
														...field.state.value,
														newQuestion,
													];
													field.handleChange(newQuestions);
													setSelectedQuestionIndex(newQuestions.length - 1);
												}}
												className="shadow-md transition-all hover:shadow-lg"
											>
												<Plus className="mr-2 h-4 w-4" />
												Add Question
											</Button>
										</div>
									)}
								</form.AppField>
							</div>
						</CardHeader>
						<CardContent>
							<form.AppField name="questions">
								{(field) => {
									const validSelectedIndex =
										field.state.value.length > 0
											? Math.min(
													selectedQuestionIndex,
													field.state.value.length - 1,
												)
											: 0;

									if (validSelectedIndex !== selectedQuestionIndex) {
										setSelectedQuestionIndex(validSelectedIndex);
									}

									return (
										<div className="space-y-6">
											{field.state.value.length === 0 ? (
												<div className="py-16 text-center text-muted-foreground">
													<div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 p-6">
														<HelpCircle className="h-12 w-12 opacity-50" />
													</div>
													<p className="mb-2 font-semibold text-xl">
														No questions yet
													</p>
													<p className="text-base">
														Click "Add Question" to get started
													</p>
												</div>
											) : (
												<div className="flex gap-6">
													{/* Left column - Question list */}
													<div className="w-[30%] pr-2">
														{/* Use ScrollArea here */}
														<ScrollArea className="max-h-[50vh] pr-2">
															<div className="space-y-3">
																{field.state.value.map((question, index) => {
																	const isComplete =
																		question.text.trim() &&
																		question.mark > 0 &&
																		question.options.length >= 2 &&
																		question.options.every(
																			(opt) => opt.text.trim().length >= 3,
																		) &&
																		question.options.some(
																			(opt) => opt.isCorrect,
																		);

																	// Get first few words of question text (max 5 words)
																	const previewText = question.text
																		? question.text
																				.split(" ")
																				.slice(0, 5)
																				.join(" ") +
																			(question.text.split(" ").length > 5
																				? "..."
																				: "")
																		: `Question ${index + 1}`;

																	return (
																		<button
																			key={question.id}
																			type="button"
																			onClick={() =>
																				setSelectedQuestionIndex(index)
																			}
																			className={cn(
																				"flex w-full cursor-pointer items-center gap-3 rounded-lg border p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5",
																				index === selectedQuestionIndex
																					? "border-primary/50 bg-primary/10 shadow-md"
																					: "border-muted-foreground/20 bg-muted/30",
																			)}
																		>
																			<div className="rounded-md bg-muted p-1.5">
																				<span className="font-bold text-sm">
																					Q{index + 1}
																				</span>
																			</div>
																			<div className="min-w-0 flex-1">
																				<p className="truncate font-medium">
																					{previewText}
																				</p>
																			</div>
																			<Badge
																				variant={
																					isComplete ? "default" : "secondary"
																				}
																				className={cn(
																					"px-2 py-0.5 font-medium text-xs",
																					isComplete &&
																						"border-green-200 bg-green-100 text-green-700",
																				)}
																			>
																				{isComplete ? (
																					<>
																						<CheckCircle2 className="mr-1 h-3 w-3" />
																						<span className="sr-only">
																							Complete
																						</span>
																					</>
																				) : (
																					"Draft"
																				)}
																			</Badge>
																		</button>
																	);
																})}
															</div>
														</ScrollArea>
													</div>

													{/* Right column - Selected question editor */}
													<div className="w-[70%] rounded-xl border-0 bg-background shadow-md">
														{field.state.value.length > 0 && (
															<div className="space-y-6 p-6">
																{/* Navigation header */}
																<div className="flex items-center justify-between">
																	<div className="flex items-center gap-3">
																		<div className="rounded-lg bg-muted p-2">
																			<span className="font-bold text-sm">
																				Q{selectedQuestionIndex + 1}
																			</span>
																		</div>
																		<span className="font-semibold text-lg">
																			Question {selectedQuestionIndex + 1}
																		</span>
																	</div>
																	<div className="flex items-center gap-2">
																		<Button
																			type="button"
																			variant="outline"
																			size="icon"
																			onClick={() =>
																				setSelectedQuestionIndex(
																					Math.max(
																						0,
																						selectedQuestionIndex - 1,
																					),
																				)
																			}
																			disabled={selectedQuestionIndex <= 0}
																			className="size-9"
																		>
																			<ChevronLeft className="h-5 w-5" />
																		</Button>
																		<span className="font-medium text-muted-foreground text-sm">
																			{selectedQuestionIndex + 1} /{" "}
																			{field.state.value.length}
																		</span>
																		<Button
																			type="button"
																			variant="outline"
																			size="icon"
																			onClick={() =>
																				setSelectedQuestionIndex(
																					Math.min(
																						field.state.value.length - 1,
																						selectedQuestionIndex + 1,
																					),
																				)
																			}
																			disabled={
																				selectedQuestionIndex >=
																				field.state.value.length - 1
																			}
																			className="size-9"
																		>
																			<ChevronRight className="h-5 w-5" />
																		</Button>
																		{field.state.value.length > 1 && (
																			<Button
																				type="button"
																				variant="destructive"
																				size="sm"
																				onClick={() => {
																					const updated =
																						field.state.value.filter(
																							(_, i) =>
																								i !== selectedQuestionIndex,
																						);
																					updated.forEach((q, i) => {
																						q.order = i;
																					});
																					field.handleChange(updated);
																					setSelectedQuestionIndex(
																						Math.min(
																							selectedQuestionIndex,
																							updated.length - 1,
																						),
																					);
																				}}
																				className="ml-2 h-9 shadow-sm"
																			>
																				<Trash2 className="mr-1 h-4 w-4" />
																				Delete
																			</Button>
																		)}
																	</div>
																</div>

																{/* Question Text */}
																<form.AppField
																	name={`questions[${selectedQuestionIndex}].text`}
																>
																	{(questionField) => (
																		<questionField.FormItem>
																			<questionField.FormLabel className="font-semibold text-base">
																				Question Text
																			</questionField.FormLabel>
																			<questionField.FormControl>
																				<Textarea
																					placeholder="Enter your question here. Be clear and concise..."
																					value={questionField.state.value}
																					onInput={(
																						e: React.FormEvent<HTMLTextAreaElement>,
																					) => {
																						questionField.handleChange(
																							(e.target as HTMLTextAreaElement)
																								.value,
																						);
																					}}
																					className={cn(
																						"min-h-[120px] resize-none border-0 bg-muted/50 font-medium text-base shadow-sm transition-all focus:bg-background focus:shadow-md",
																						questionField.state.meta.errors
																							?.length &&
																							"border border-destructive focus-visible:ring-destructive",
																					)}
																					required
																				/>
																			</questionField.FormControl>
																			<questionField.FormMessage />
																		</questionField.FormItem>
																	)}
																</form.AppField>

																{/* Question Mark */}
																<form.AppField
																	name={`questions[${selectedQuestionIndex}].mark`}
																>
																	{(markField) => (
																		<markField.FormItem>
																			<markField.FormLabel className="font-semibold text-base">
																				Marks for this Question
																			</markField.FormLabel>
																			<markField.FormControl>
																				<div className="flex items-center gap-4">
																					<Button
																						type="button"
																						variant="outline"
																						size="lg"
																						onClick={() => {
																							const currentMark =
																								markField.state.value || 1;
																							if (currentMark > 1) {
																								markField.handleChange(
																									currentMark - 1,
																								);
																							}
																						}}
																						disabled={
																							(markField.state.value || 1) <= 1
																						}
																						className="h-12 w-12 rounded-xl border-2 shadow-sm transition-all hover:shadow-md"
																					>
																						<Minus className="h-4 w-4" />
																					</Button>
																					<div className="flex min-w-[120px] items-center justify-center gap-3 rounded-xl border-2 bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-3 shadow-sm">
																						<Hash className="h-5 w-5 text-primary" />
																						<span className="font-bold text-primary text-xl">
																							{markField.state.value || 1}
																						</span>
																						<span className="font-medium text-muted-foreground">
																							mark
																							{(markField.state.value || 1) !==
																							1
																								? "s"
																								: ""}
																						</span>
																					</div>
																					<Button
																						type="button"
																						variant="outline"
																						size="lg"
																						onClick={() => {
																							const currentMark =
																								markField.state.value || 1;
																							markField.handleChange(
																								currentMark + 1,
																							);
																						}}
																						className="h-12 w-12 rounded-xl border-2 shadow-sm transition-all hover:shadow-md"
																					>
																						<Plus className="h-4 w-4" />
																					</Button>
																				</div>
																			</markField.FormControl>
																			<markField.FormMessage />
																		</markField.FormItem>
																	)}
																</form.AppField>

																<Separator className="my-8" />

																{/* Options */}
																<div className="space-y-6">
																	<Label className="font-semibold text-base">
																		Answer Options
																	</Label>
																	<form.AppField
																		name={`questions[${selectedQuestionIndex}].options`}
																	>
																		{(optionsField) => (
																			<optionsField.FormItem>
																				<optionsField.FormControl>
																					<RadioGroup
																						value={optionsField.state.value
																							.findIndex((opt) => opt.isCorrect)
																							.toString()}
																						onValueChange={(value: string) => {
																							const optionIndex =
																								Number.parseInt(value, 10);
																							const updated =
																								optionsField.state.value.map(
																									(opt, i) => ({
																										...opt,
																										isCorrect:
																											i === optionIndex,
																									}),
																								);
																							optionsField.handleChange(
																								updated,
																							);
																						}}
																						className="space-y-0"
																					>
																						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
																							{optionsField.state.value.map(
																								(option, optionIndex) => (
																									// biome-ignore lint/a11y/useSemanticElements: <cannot use button here>
																									<div
																										key={option.id}
																										role="button"
																										tabIndex={0}
																										className={cn(
																											"flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all hover:shadow-sm",
																											option.isCorrect
																												? "border-green-200 bg-green-50"
																												: "border-muted-foreground/20 bg-muted/30",
																										)}
																										onClick={() => {
																											const updated =
																												optionsField.state.value.map(
																													(opt, i) => ({
																														...opt,
																														isCorrect:
																															i === optionIndex,
																													}),
																												);
																											optionsField.handleChange(
																												updated,
																											);
																										}}
																										onKeyDown={(e) => {
																											if (
																												e.key === "Enter" ||
																												e.key === " "
																											) {
																												e.preventDefault();
																												const updated =
																													optionsField.state.value.map(
																														(opt, i) => ({
																															...opt,
																															isCorrect:
																																i ===
																																optionIndex,
																														}),
																													);
																												optionsField.handleChange(
																													updated,
																												);
																											}
																										}}
																									>
																										<div className="flex h-5 w-5 shrink-0 items-center justify-center">
																											{option.isCorrect && (
																												<Check className="h-4 w-4 text-green-600" />
																											)}
																										</div>
																										<RadioGroupItem
																											value={optionIndex.toString()}
																											id={`q${selectedQuestionIndex}-opt${optionIndex}`}
																											className="hidden"
																										/>
																										<div className="min-w-0 flex-1">
																											<form.AppField
																												name={`questions[${selectedQuestionIndex}].options[${optionIndex}].text`}
																											>
																												{(optionField) => (
																													<optionField.FormItem>
																														<optionField.FormControl>
																															<Input
																																placeholder={`Option ${String.fromCharCode(
																																	65 +
																																		optionIndex,
																																)}`}
																																value={
																																	optionField
																																		.state.value
																																}
																																onChange={(e) =>
																																	optionField.handleChange(
																																		e.target
																																			.value,
																																	)
																																}
																																className={cn(
																																	"h-11 border-0 bg-transparent font-medium shadow-none transition-all focus:shadow-sm focus-visible:bg-background",
																																	optionField
																																		.state.meta
																																		.errors
																																		?.length &&
																																		"border border-destructive focus-visible:ring-destructive",
																																)}
																																required
																															/>
																														</optionField.FormControl>
																														<optionField.FormMessage />
																													</optionField.FormItem>
																												)}
																											</form.AppField>
																										</div>
																										{optionsField.state.value
																											.length > 2 && (
																											<Button
																												type="button"
																												variant="ghost"
																												size="sm"
																												onClick={(e) => {
																													e.stopPropagation();
																													const updated =
																														optionsField.state.value.filter(
																															(_, i) =>
																																i !==
																																optionIndex,
																														);
																													updated.forEach(
																														(opt, i) => {
																															opt.order = i;
																														},
																													);
																													if (
																														optionsField.state
																															.value[
																															optionIndex
																														]?.isCorrect &&
																														updated.length > 0
																													) {
																														updated[0].isCorrect = true;
																													}
																													optionsField.handleChange(
																														updated,
																													);
																												}}
																												className="h-9 w-9 shrink-0 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
																											>
																												<Trash2 className="h-4 w-4" />
																											</Button>
																										)}
																									</div>
																								),
																							)}
																							{optionsField.state.value.length <
																								4 && (
																								<button
																									type="button"
																									onClick={() => {
																										const newOption = {
																											id: createId(),
																											text: "",
																											isCorrect: false,
																											order:
																												optionsField.state.value
																													.length,
																										};
																										optionsField.handleChange([
																											...optionsField.state
																												.value,
																											newOption,
																										]);
																									}}
																									className="flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 border-muted-foreground/30 border-dashed bg-muted/20 p-6 text-left transition-all hover:border-primary/30 hover:bg-primary/5"
																								>
																									<div className="flex h-5 w-5 items-center justify-center">
																										<Plus className="h-4 w-4 text-muted-foreground" />
																									</div>
																									<span className="font-medium text-muted-foreground">
																										Add another option
																									</span>
																								</button>
																							)}
																						</div>
																					</RadioGroup>
																				</optionsField.FormControl>
																				<optionsField.FormMessage />
																			</optionsField.FormItem>
																		)}
																	</form.AppField>
																</div>
															</div>
														)}
													</div>
												</div>
											)}
											<field.FormMessage />
										</div>
									);
								}}
							</form.AppField>
						</CardContent>
					</Card>

					<div className="flex justify-end pt-4">
						<Button
							type="submit"
							size="lg"
							className="px-12 py-3 font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-xl"
						>
							Create Exam
						</Button>
					</div>
				</form>
			</div>
		</form.AppForm>
	);
}
