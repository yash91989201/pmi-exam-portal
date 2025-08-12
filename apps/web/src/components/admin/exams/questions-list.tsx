import { Plus, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useFormContext } from "./form-context";
import type { Question } from './types';

interface QuestionsListProps {
	selectedQuestionIndex: number;
	setSelectedQuestionIndex: (index: number) => void;
	addQuestion: () => void;
	removeQuestion: (index: number) => void;
	getCorrectAnswersCount: (questionIndex: number) => number;
}

export function QuestionsList({
	selectedQuestionIndex,
	setSelectedQuestionIndex,
	addQuestion,
	removeQuestion,
	getCorrectAnswersCount,
}: QuestionsListProps) {
	const form = useFormContext();
	const questions = form.getFieldValue("questions") || [];

	return (
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
					{questions.map((question: Question, index: number) => {
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
	);
}