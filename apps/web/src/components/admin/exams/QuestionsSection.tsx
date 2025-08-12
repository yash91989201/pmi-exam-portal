import { createId } from "@paralleldrive/cuid2";
import { AlertCircle, HelpCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useFormContext } from "@/lib/form-context";
import { QuestionEditor } from "./QuestionEditor";
import { QuestionsList } from "./QuestionsList";

interface QuestionsSectionProps {
	selectedQuestionIndex: number;
	setSelectedQuestionIndex: (index: number) => void;
	defaultMark: number;
	setDefaultMark: (mark: number) => void;
}

export function QuestionsSection({
	selectedQuestionIndex,
	setSelectedQuestionIndex,
	defaultMark,
	setDefaultMark,
}: QuestionsSectionProps) {
	const form = useFormContext();

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
					<form.Field name="questions">
						{(field) => (
							<div className="flex items-center gap-4">
								<Label
									htmlFor="default-mark"
									className="mr-2 font-semibold text-base"
								>
									Default Question Mark
								</Label>
								<select
									id="default-mark"
									value={defaultMark}
									onChange={(e) => setDefaultMark(Number(e.target.value))}
									className="rounded-md border px-2 py-1 font-medium text-base"
								>
									<option value={1}>1</option>
									<option value={2}>2</option>
									<option value={3}>3</option>
									<option value={4}>4</option>
									<option value={5}>5</option>
									<option value={10}>10</option>
									<option value={15}>15</option>
									<option value={20}>20</option>
									<option value={25}>25</option>
								</select>
								<Button
									type="button"
									variant="default"
									size="lg"
									onClick={() => {
										const newQuestion = {
											id: createId(),
											text: "",
											mark: defaultMark,
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
										const newQuestions = [...field.state.value, newQuestion];
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
					</form.Field>
				</div>
			</CardHeader>
			<CardContent>
				<form.Field name="questions">
					{(field) => {
						const validSelectedIndex =
							field.state.value.length > 0
								? Math.min(selectedQuestionIndex, field.state.value.length - 1)
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
										<QuestionsList
											selectedQuestionIndex={selectedQuestionIndex}
											setSelectedQuestionIndex={setSelectedQuestionIndex}
										/>

										{/* Right column - Selected question editor */}
										<QuestionEditor
											selectedQuestionIndex={selectedQuestionIndex}
											setSelectedQuestionIndex={setSelectedQuestionIndex}
										/>
									</div>
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
						);
					}}
				</form.Field>
			</CardContent>
		</Card>
	);
}
