import { createId } from "@paralleldrive/cuid2";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import {
	BookOpen,
	GripVertical,
	Hash,
	Loader2,
	Plus,
	Trash2,
} from "lucide-react";
import type React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { type ExamFormData, ExamFormSchema } from "@/lib/schema/exam";
import { cn } from "@/lib/utils";
import { orpcClient } from "@/utils/orpc";

export function ExamForm() {
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
						{ id: createId(), text: "", isCorrect: false, order: 0 },
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
						to: "/admin",
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
		<form
			className="flex flex-col gap-6"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			{/* Exam Basic Information */}
			<Card>
				<CardHeader>
					<CardTitle>Exam Information</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<form.Field name="certification">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="certification" className="font-medium">
									Certification Name
								</Label>
								<div className="relative">
									<div className="absolute top-2.5 left-3 text-muted-foreground">
										<BookOpen size={18} strokeWidth={2} />
									</div>
									<Input
										id="certification"
										placeholder="e.g., PMP, CAPM, PMI-ACP"
										type="text"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										className={cn(
											"pl-9 transition-all",
											field.state.meta.errors?.length &&
												"border-destructive focus-visible:ring-destructive",
										)}
										autoComplete="off"
										required
										autoFocus
									/>
								</div>
								{field.state.meta.errors?.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors.join(", ")}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="mark">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="mark" className="font-medium">
									Total Marks
								</Label>
								<div className="relative">
									<div className="absolute top-2.5 left-3 text-muted-foreground">
										<Hash size={18} strokeWidth={2} />
									</div>
									<Input
										id="mark"
										placeholder="100"
										type="number"
										min="1"
										value={field.state.value || ""}
										onChange={(e) => {
											const value = e.target.value;
											field.handleChange(
												value === "" ? 0 : Number.parseInt(value, 10),
											);
										}}
										className={cn(
											"pl-9 transition-all",
											field.state.meta.errors?.length &&
												"border-destructive focus-visible:ring-destructive",
										)}
										autoComplete="off"
										required
									/>
								</div>
								{field.state.meta.errors?.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors.join(", ")}
									</p>
								)}
							</div>
						)}
					</form.Field>
				</CardContent>
			</Card>

			{/* Questions Section */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Questions</CardTitle>
					<form.Field name="questions">
						{(field) => (
							<Button
								type="button"
								variant="outline"
								size="sm"
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
									field.handleChange([...field.state.value, newQuestion]);
								}}
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Question
							</Button>
						)}
					</form.Field>
				</CardHeader>
				<CardContent className="space-y-6">
					<form.Field name="questions">
						{(field) => (
							<div className="space-y-6">
								{field.state.value.map((question, questionIndex) => (
									<Card key={question.id} className="border border-border/50">
										<CardHeader className="flex flex-row items-center justify-between pb-3">
											<div className="flex items-center gap-2">
												<GripVertical className="h-4 w-4 text-muted-foreground" />
												<h4 className="font-semibold text-sm">
													Question {questionIndex + 1}
												</h4>
											</div>
											{field.state.value.length > 1 && (
												<Button
													type="button"
													variant="destructive"
													size="sm"
													onClick={() => {
														const updated = field.state.value.filter(
															(_, i) => i !== questionIndex,
														);
														// Reorder remaining questions
														updated.forEach((q, i) => {
															q.order = i;
														});
														field.handleChange(updated);
													}}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</CardHeader>
										<CardContent className="space-y-4">
											{/* Question Text */}
											<form.Field name={`questions[${questionIndex}].text`}>
												{(questionField) => (
													<div className="space-y-2">
														<Label className="font-medium">Question Text</Label>
														<Textarea
															placeholder="Enter your question here..."
															value={questionField.state.value}
															onInput={(
																e: React.FormEvent<HTMLTextAreaElement>,
															) => {
																questionField.handleChange(
																	(e.target as HTMLTextAreaElement).value,
																);
															}}
															className={cn(
																"min-h-[80px] transition-all",
																questionField.state.meta.errors?.length &&
																	"border-destructive focus-visible:ring-destructive",
															)}
															required
														/>
														{questionField.state.meta.errors?.length > 0 && (
															<p className="text-destructive text-sm">
																{questionField.state.meta.errors.join(", ")}
															</p>
														)}
													</div>
												)}
											</form.Field>

											{/* Question Mark */}
											<form.Field name={`questions[${questionIndex}].mark`}>
												{(markField) => (
													<div className="space-y-2">
														<Label className="font-medium">Marks</Label>
														<Input
															type="number"
															min="1"
															placeholder="1"
															value={markField.state.value || ""}
															onChange={(e) => {
																const value = e.target.value;
																markField.handleChange(
																	value === "" ? 1 : Number.parseInt(value, 10),
																);
															}}
															className={cn(
																"w-24 ",
																markField.state.meta.errors?.length &&
																	"border-destructive focus-visible:ring-destructive",
															)}
															required
														/>
														{markField.state.meta.errors?.length > 0 && (
															<p className="text-destructive text-sm">
																{markField.state.meta.errors.join(", ")}
															</p>
														)}
													</div>
												)}
											</form.Field>

											{/* Options */}
											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<Label className="font-medium">Answer Options</Label>
													<form.Field
														name={`questions[${questionIndex}].options`}
													>
														{(optionsField) => (
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={() => {
																	if (optionsField.state.value.length < 6) {
																		const newOption = {
																			id: createId(),
																			text: "",
																			isCorrect: false,
																			order: optionsField.state.value.length,
																		};
																		optionsField.handleChange([
																			...optionsField.state.value,
																			newOption,
																		]);
																	}
																}}
																disabled={optionsField.state.value.length >= 6}
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
																const optionIndex = Number.parseInt(value, 10);
																const updated = optionsField.state.value.map(
																	(opt, i) => ({
																		...opt,
																		isCorrect: i === optionIndex,
																	}),
																);
																optionsField.handleChange(updated);
															}}
															className="space-y-3"
														>
															{optionsField.state.value.map(
																(option, optionIndex) => (
																	<div
																		key={option.id}
																		className="flex items-center gap-3 rounded-lg border p-3"
																	>
																		<RadioGroupItem
																			value={optionIndex.toString()}
																			id={`q${questionIndex}-opt${optionIndex}`}
																		/>
																		<form.Field
																			name={`questions[${questionIndex}].options[${optionIndex}].text`}
																		>
																			{(optionField) => (
																				<Input
																					placeholder={`Option ${String.fromCharCode(
																						65 + optionIndex,
																					)}`}
																					value={optionField.state.value}
																					onChange={(e) =>
																						optionField.handleChange(
																							e.target.value,
																						)
																					}
																					className={cn(
																						"flex-1 transition-all",
																						optionField.state.meta.errors
																							?.length &&
																							"border-destructive focus-visible:ring-destructive",
																					)}
																					required
																				/>
																			)}
																		</form.Field>
																		{optionsField.state.value.length > 2 && (
																			<Button
																				type="button"
																				variant="destructive"
																				size="sm"
																				onClick={() => {
																					const updated =
																						optionsField.state.value.filter(
																							(_, i) => i !== optionIndex,
																						);
																					// Reorder remaining options
																					updated.forEach((opt, i) => {
																						opt.order = i;
																					});
																					// If the deleted option was correct, make the first option correct
																					if (
																						optionsField.state.value[
																							optionIndex
																						]?.isCorrect &&
																						updated.length > 0
																					) {
																						updated[0].isCorrect = true;
																					}
																					optionsField.handleChange(updated);
																				}}
																			>
																				<Trash2 className="h-3 w-3" />
																			</Button>
																		)}
																	</div>
																),
															)}
														</RadioGroup>
													)}
												</form.Field>
											</div>
										</CardContent>
									</Card>
								))}
								{field.state.meta.errors?.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors.join(", ")}
									</p>
								)}
							</div>
						)}
					</form.Field>
				</CardContent>
			</Card>

			{/* Submit Button */}
			<form.Subscribe>
				{({ isSubmitting }) => (
					<Button
						type="submit"
						className="w-full transition-all"
						disabled={isSubmitting}
						size="lg"
					>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating Exam...
							</>
						) : (
							"Create Exam"
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
