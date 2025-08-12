import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useFormContext } from "@/lib/form-context";
import { OptionsSection } from "./OptionsSection";
import { QuestionMarks } from "./QuestionMarks";
import { QuestionText } from "./QuestionText";

interface QuestionEditorProps {
	selectedQuestionIndex: number;
	setSelectedQuestionIndex: (index: number) => void;
}

export function QuestionEditor({
	selectedQuestionIndex,
	setSelectedQuestionIndex,
}: QuestionEditorProps) {
	const form = useFormContext();

	return (
		<form.Field name="questions">
			{(field) => {
				const totalQuestions = field.state.value.length;

				return (
					<div className="w-[70%] rounded-xl border-0 bg-background shadow-md">
						{totalQuestions > 0 && (
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
													Math.max(0, selectedQuestionIndex - 1),
												)
											}
											disabled={selectedQuestionIndex <= 0}
											className="h-9 w-9 rounded-full"
										>
											<ChevronLeft className="h-5 w-5" />
										</Button>
										<span className="font-medium text-muted-foreground text-sm">
											{selectedQuestionIndex + 1} / {totalQuestions}
										</span>
										<Button
											type="button"
											variant="outline"
											size="icon"
											onClick={() =>
												setSelectedQuestionIndex(
													Math.min(
														totalQuestions - 1,
														selectedQuestionIndex + 1,
													),
												)
											}
											disabled={selectedQuestionIndex >= totalQuestions - 1}
											className="h-9 w-9 rounded-full"
										>
											<ChevronRight className="h-5 w-5" />
										</Button>
										{totalQuestions > 1 && (
											<Button
												type="button"
												variant="destructive"
												size="sm"
												onClick={() => {
													const updated = field.state.value.filter(
														(_, i) => i !== selectedQuestionIndex,
													);
													updated.forEach((q, i) => {
														q.order = i;
													});
													field.handleChange(updated);
													setSelectedQuestionIndex(
														Math.min(selectedQuestionIndex, updated.length - 1),
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
								<QuestionText selectedQuestionIndex={selectedQuestionIndex} />

								{/* Question Mark */}
								<QuestionMarks selectedQuestionIndex={selectedQuestionIndex} />

								<Separator className="my-8" />

								{/* Options */}
								<OptionsSection selectedQuestionIndex={selectedQuestionIndex} />
							</div>
						)}
					</div>
				);
			}}
		</form.Field>
	);
}
