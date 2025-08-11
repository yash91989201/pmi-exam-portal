import { createId } from "@paralleldrive/cuid2";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import {
	AlertCircle,
	BookOpen,
	Check,
	CheckCircle2,
	GripVertical,
	Hash,
	HelpCircle,
	Minus,
	Plus,
	Target,
	Trash2,
	Trophy,
} from "lucide-react";
import type React from "react";
import { toast } from "sonner";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { type ExamFormData, ExamFormSchema } from "@/lib/schema/exam";
import { cn } from "@/lib/utils";
import { orpcClient } from "@/utils/orpc";

export function CreateExamForm() {
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			id: createId(),
			certification: "",
			mark: 0,
			questions: [
				{
					id: createId(),
					text: "",
					mark: 1,
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
		<TooltipProvider>
			<div className="mx-auto space-y-8 pb-8">
				<form
					className="space-y-8"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
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
							<form.Field name="certification">
								{(field) => (
									<div className="space-y-4">
										<div className="flex items-center gap-2">
											<Label
												htmlFor="certification"
												className="font-semibold text-base"
											>
												Certification Name
											</Label>
											<Tooltip>
												<TooltipTrigger>
													<HelpCircle className="h-4 w-4 text-muted-foreground" />
												</TooltipTrigger>
												<TooltipContent>
													<p>
														Enter the PMI certification type (e.g., PMP, CAPM,
														PMI-ACP)
													</p>
												</TooltipContent>
											</Tooltip>
										</div>
										<div className="relative">
											<div className="absolute top-4 left-4 text-muted-foreground">
												<BookOpen size={20} strokeWidth={2} />
											</div>
											<Input
												id="certification"
												placeholder="e.g., Project Management Professional (PMP)"
												type="text"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												className={cn(
													"h-14 border-0 bg-background/80 pr-4 pl-12 font-medium text-base shadow-sm transition-all focus:bg-background focus:shadow-md",
													field.state.meta.errors?.length &&
														"border border-destructive focus-visible:ring-destructive",
												)}
												autoComplete="off"
												required
												autoFocus
											/>
										</div>
										{field.state.meta.errors?.length > 0 && (
											<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
												<p className="flex items-center gap-2 font-medium text-destructive text-sm">
													<AlertCircle className="h-4 w-4" />
													{field.state.meta.errors.join(", ")}
												</p>
											</div>
										)}
									</div>
								)}
							</form.Field>

							<form.Field name="questions">
								{(field) => {
									const totalMarks = field.state.value.reduce(
										(sum, question) => sum + (question.mark || 0),
										0,
									);
									return (
										<div className="space-y-4">
											<div className="flex items-center gap-2">
												<Label className="font-semibold text-base">
													Total Marks
												</Label>
												<Tooltip>
													<TooltipTrigger>
														<HelpCircle className="h-4 w-4 text-muted-foreground" />
													</TooltipTrigger>
													<TooltipContent>
														<p>
															Automatically calculated from all question marks
														</p>
													</TooltipContent>
												</Tooltip>
											</div>
											<div className="flex items-center gap-6">
												<div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-sm">
													<div className="flex items-center gap-3">
														<div className="rounded-lg bg-primary/20 p-2">
															<Trophy className="h-6 w-6 text-primary" />
														</div>
														<div>
															<div className="flex items-baseline gap-2">
																<span className="font-bold text-3xl text-primary">
																	{totalMarks}
																</span>
																<span className="font-medium text-muted-foreground">
																	marks
																</span>
															</div>
															<p className="mt-1 text-muted-foreground text-sm">
																Total exam score
															</p>
														</div>
													</div>
												</div>
												<div className="rounded-lg border bg-muted/50 px-4 py-3">
													<div className="flex items-center gap-2 text-muted-foreground text-sm">
														<Hash className="h-4 w-4" />
														<span>
															Based on {field.state.value.length} question
															{field.state.value.length !== 1 ? "s" : ""}
														</span>
													</div>
												</div>
											</div>
										</div>
									);
								}}
							</form.Field>
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
								<form.Field name="questions">
									{(field) => (
										<div className="flex items-center gap-4">
											<Badge
												variant="outline"
												className="border-2 px-4 py-2 font-semibold"
											>
												{field.state.value.length} Question
												{field.state.value.length !== 1 ? "s" : ""}
											</Badge>
											<Button
												type="button"
												variant="default"
												size="lg"
												onClick={() => {
													const newQuestion = {
														id: createId(),
														text: "",
														mark: 1,
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
													field.handleChange([
														...field.state.value,
														newQuestion,
													]);
												}}
												className="shadow-md transition-all hover:shadow-lg"
											>
												<Plus className="mr-2 h-4 w-4" />
												Add Question
											</Button>
										</div>
									)}
								</form.Field>
							</div>
						</CardHeader>
						<CardContent>
							<form.Field name="questions">
								{(field) => (
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
											<Accordion
												type="single"
												collapsible
												className="space-y-6"
											>
												{field.state.value.map((question, questionIndex) => {
													const hasValidOptions =
														question.options.length >= 2 &&
														question.options.every((opt) => opt.text.trim()) &&
														question.options.some((opt) => opt.isCorrect);
													const isComplete =
														question.text.trim() &&
														question.mark > 0 &&
														hasValidOptions;

													return (
														<AccordionItem
															key={question.id}
															value={question.id}
															className="rounded-xl border-0 bg-background shadow-md transition-all duration-200 hover:shadow-lg"
														>
															<AccordionTrigger className="px-8 py-6 hover:no-underline">
																<div className="flex w-full items-center gap-4">
																	<div className="flex items-center gap-3">
																		<GripVertical className="h-5 w-5 text-muted-foreground" />
																		<div className="rounded-lg bg-muted p-2">
																			<span className="font-bold text-sm">
																				Q{questionIndex + 1}
																			</span>
																		</div>
																		<span className="font-semibold text-lg">
																			Question {questionIndex + 1}
																		</span>
																	</div>
																	<div className="mr-4 ml-auto flex items-center gap-3">
																		<Badge
																			variant={
																				isComplete ? "default" : "secondary"
																			}
																			className={cn(
																				"px-3 py-1 font-medium",
																				isComplete &&
																					"border-green-200 bg-green-100 text-green-700",
																			)}
																		>
																			{isComplete ? (
																				<>
																					<CheckCircle2 className="mr-1 h-3 w-3" />
																					Complete
																				</>
																			) : (
																				"Incomplete"
																			)}
																		</Badge>
																		{field.state.value.length > 1 && (
																			<Button
																				type="button"
																				variant="destructive"
																				size="sm"
																				onClick={(e) => {
																					e.stopPropagation();
																					const updated =
																						field.state.value.filter(
																							(_, i) => i !== questionIndex,
																						);
																					updated.forEach((q, i) => {
																						q.order = i;
																					});
																					field.handleChange(updated);
																				}}
																				className="h-9 w-9 p-0 shadow-sm"
																			>
																				<Trash2 className="h-4 w-4" />
																			</Button>
																		)}
																	</div>
																</div>
															</AccordionTrigger>
															<AccordionContent className="px-8 pb-8">
																<div className="space-y-8">
																	{/* Question Text */}
																	<form.Field
																		name={`questions[${questionIndex}].text`}
																	>
																		{(questionField) => (
																			<div className="space-y-4">
																				<Label className="font-semibold text-base">
																					Question Text
																				</Label>
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
																				{questionField.state.meta.errors
																					?.length > 0 && (
																					<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
																						<p className="flex items-center gap-2 font-medium text-destructive text-sm">
																							<AlertCircle className="h-4 w-4" />
																							{questionField.state.meta.errors.join(
																								", ",
																							)}
																						</p>
																					</div>
																				)}
																			</div>
																		)}
																	</form.Field>

																	{/* Question Mark */}
																	<form.Field
																		name={`questions[${questionIndex}].mark`}
																	>
																		{(markField) => (
																			<div className="space-y-4">
																				<Label className="font-semibold text-base">
																					Marks for this Question
																				</Label>
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
																				{markField.state.meta.errors?.length >
																					0 && (
																					<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
																						<p className="flex items-center gap-2 font-medium text-destructive text-sm">
																							<AlertCircle className="h-4 w-4" />
																							{markField.state.meta.errors.join(
																								", ",
																							)}
																						</p>
																					</div>
																				)}
																			</div>
																		)}
																	</form.Field>

																	<Separator className="my-8" />

																	{/* Options */}
																	<div className="space-y-6">
																		<div className="flex items-center justify-between">
																			<Label className="font-semibold text-base">
																				Answer Options
																			</Label>
																			<form.Field
																				name={`questions[${questionIndex}].options`}
																			>
																				{(optionsField) => (
																					<Button
																						type="button"
																						variant="outline"
																						size="sm"
																						onClick={() => {
																							if (
																								optionsField.state.value
																									.length < 4
																							) {
																								const newOption = {
																									id: createId(),
																									text: "",
																									isCorrect: false,
																									order:
																										optionsField.state.value
																											.length,
																								};
																								optionsField.handleChange([
																									...optionsField.state.value,
																									newOption,
																								]);
																							}
																						}}
																						disabled={
																							optionsField.state.value.length >=
																							4
																						}
																						className="shadow-sm transition-all hover:shadow-md"
																					>
																						<Plus className="mr-2 h-3 w-3" />
																						Add Option
																					</Button>
																				)}
																			</form.Field>
																		</div>

																		<form.Field
																			name={`questions[${questionIndex}].options`}
																		>
																			{(optionsField) => (
																				<RadioGroup
																					value={optionsField.state.value
																						.findIndex((opt) => opt.isCorrect)
																						.toString()}
																					onValueChange={(value: string) => {
																						const optionIndex = Number.parseInt(
																							value,
																							10,
																						);
																						const updated =
																							optionsField.state.value.map(
																								(opt, i) => ({
																									...opt,
																									isCorrect: i === optionIndex,
																								}),
																							);
																						optionsField.handleChange(updated);
																					}}
																					className="space-y-0"
																				>
																					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
																						{optionsField.state.value.map(
																							(option, optionIndex) => (
																								<button
																									key={option.id}
																									type="button"
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
																															i === optionIndex,
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
																										id={`q${questionIndex}-opt${optionIndex}`}
																										className="hidden"
																									/>
																									<div className="min-w-0 flex-1">
																										<form.Field
																											name={`questions[${questionIndex}].options[${optionIndex}].text`}
																										>
																											{(optionField) => (
																												<Input
																													placeholder={`Option ${String.fromCharCode(
																														65 + optionIndex,
																													)}`}
																													value={
																														optionField.state
																															.value
																													}
																													onChange={(e) =>
																														optionField.handleChange(
																															e.target.value,
																														)
																													}
																													className={cn(
																														"h-11 border-0 bg-transparent font-medium shadow-none transition-all focus:shadow-sm focus-visible:bg-background",
																														optionField.state
																															.meta.errors
																															?.length &&
																															"border border-destructive focus-visible:ring-destructive",
																													)}
																													required
																												/>
																											)}
																										</form.Field>
																									</div>
																									{optionsField.state.value
																										.length > 2 && (
																										<Button
																											type="button"
																											variant="ghost"
																											size="sm"
																											onClick={() => {
																												const updated =
																													optionsField.state.value.filter(
																														(_, i) =>
																															i !== optionIndex,
																													);
																												updated.forEach(
																													(opt, i) => {
																														opt.order = i;
																													},
																												);
																												if (
																													optionsField.state
																														.value[optionIndex]
																														?.isCorrect &&
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
																								</button>
																							),
																						)}
																					</div>
																				</RadioGroup>
																			)}
																		</form.Field>
																	</div>
																</div>
															</AccordionContent>
														</AccordionItem>
													);
												})}
											</Accordion>
										)}
										{field.state.meta.errors?.length > 0 && (
											<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
												<p className="flex items-center gap-2 font-medium text-destructive">
													<AlertCircle className="h-4 w-4" />
													{field.state.meta.errors.join(", ")}
												</p>
											</div>
										)}
									</div>
								)}
							</form.Field>
						</CardContent>
					</Card>

					<div className="flex justify-end pt-4">
						<Button
							type="submit"
							size="lg"
							className="px-12 py-3 font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-xl"
						>
							<Trophy className="mr-2 h-5 w-5" />
							Create Exam
						</Button>
					</div>
				</form>
			</div>
		</TooltipProvider>
	);
}
