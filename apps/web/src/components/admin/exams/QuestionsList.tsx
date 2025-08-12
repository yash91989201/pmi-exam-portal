import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFormContext } from "@/lib/form-context";
import { cn } from "@/lib/utils";

interface QuestionsListProps {
	selectedQuestionIndex: number;
	setSelectedQuestionIndex: (index: number) => void;
}

export function QuestionsList({
	selectedQuestionIndex,
	setSelectedQuestionIndex,
}: QuestionsListProps) {
	const form = useFormContext();

	return (
		<div className="w-[30%] pr-2">
			<ScrollArea className="max-h-[50vh] pr-2">
				<form.Field name="questions">
					{(field) => (
						<div className="space-y-3">
							{field.state.value.map((question, index) => {
								const isComplete =
									question.text.trim() &&
									question.mark > 0 &&
									question.options.length >= 2 &&
									question.options.every(
										(opt) => opt.text.trim().length >= 3,
									) &&
									question.options.some((opt) => opt.isCorrect);

								// Get first few words of question text (max 5 words)
								const previewText = question.text
									? question.text.split(" ").slice(0, 5).join(" ") +
										(question.text.split(" ").length > 5 ? "..." : "")
									: `Question ${index + 1}`;

								return (
									<button
										key={question.id}
										type="button"
										onClick={() => setSelectedQuestionIndex(index)}
										className={cn(
											"flex w-full cursor-pointer items-center gap-3 rounded-lg border p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5",
											index === selectedQuestionIndex
												? "border-primary/50 bg-primary/10 shadow-md"
												: "border-muted-foreground/20 bg-muted/30",
										)}
									>
										<div className="rounded-md bg-muted p-1.5">
											<span className="font-bold text-sm">Q{index + 1}</span>
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium">{previewText}</p>
										</div>
										<Badge
											variant={isComplete ? "default" : "secondary"}
											className={cn(
												"px-2 py-0.5 font-medium text-xs",
												isComplete &&
													"border-green-200 bg-green-100 text-green-700",
											)}
										>
											{isComplete ? (
												<>
													<CheckCircle2 className="mr-1 h-3 w-3" />
													<span className="sr-only">Complete</span>
												</>
											) : (
												"Draft"
											)}
										</Badge>
									</button>
								);
							})}
						</div>
					)}
				</form.Field>
			</ScrollArea>
		</div>
	);
}
