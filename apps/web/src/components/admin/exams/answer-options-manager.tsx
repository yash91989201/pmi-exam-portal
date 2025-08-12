import { Plus, Minus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

interface AnswerOptionsManagerProps {
	currentQuestion: Question;
	questionIndex: number;
	addOption: (questionIndex: number) => void;
	removeOption: (questionIndex: number, optionIndex: number) => void;
	toggleOptionCorrect: (questionIndex: number, optionIndex: number) => void;
	updateOptionText: (questionIndex: number, optionIndex: number, text: string) => void;
	getCorrectAnswersCount: (questionIndex: number) => number;
}

export function AnswerOptionsManager({
	currentQuestion,
	questionIndex,
	addOption,
	removeOption,
	toggleOptionCorrect,
	updateOptionText,
	getCorrectAnswersCount,
}: AnswerOptionsManagerProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Label className="text-base font-medium">
					Answer Options * ({getCorrectAnswersCount(questionIndex)} correct)
				</Label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => addOption(questionIndex)}
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
							onClick={() => toggleOptionCorrect(questionIndex, optionIndex)}
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
								onChange={(e) => updateOptionText(questionIndex, optionIndex, e.target.value)}
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
								onClick={() => removeOption(questionIndex, optionIndex)}
								className="flex-shrink-0 text-slate-400 hover:text-red-600"
							>
								<Minus className="h-4 w-4" />
							</Button>
						)}
					</div>
				))}
			</div>

			{getCorrectAnswersCount(questionIndex) === 0 && (
				<p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-md p-2">
					⚠️ Please mark at least one option as correct
				</p>
			)}
		</div>
	);
}