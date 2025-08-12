import { ArrowLeft, ArrowRight, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "./form-context";
import { AnswerOptionsManager } from "./answer-options-manager";

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

interface QuestionEditorProps {
	selectedQuestionIndex: number;
	setSelectedQuestionIndex: (index: number) => void;
	questionsLength: number;
	currentQuestion: Question;
	updateQuestionText: (questionIndex: number, text: string) => void;
	updateQuestionMark: (questionIndex: number, mark: number) => void;
	addOption: (questionIndex: number) => void;
	removeOption: (questionIndex: number, optionIndex: number) => void;
	toggleOptionCorrect: (questionIndex: number, optionIndex: number) => void;
	updateOptionText: (questionIndex: number, optionIndex: number, text: string) => void;
	getCorrectAnswersCount: (questionIndex: number) => number;
}

export function QuestionEditor({
	selectedQuestionIndex,
	setSelectedQuestionIndex,
	questionsLength,
	currentQuestion,
	updateQuestionText,
	updateQuestionMark,
	addOption,
	removeOption,
	toggleOptionCorrect,
	updateOptionText,
	getCorrectAnswersCount,
}: QuestionEditorProps) {
	const form = useFormContext();

	return (
		<Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-slate-800/80">
			<div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold text-white">
						Question {selectedQuestionIndex + 1} of {questionsLength}
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
								setSelectedQuestionIndex(Math.min(questionsLength - 1, selectedQuestionIndex + 1))
							}
							disabled={selectedQuestionIndex === questionsLength - 1}
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
				<AnswerOptionsManager
					currentQuestion={currentQuestion}
					questionIndex={selectedQuestionIndex}
					addOption={addOption}
					removeOption={removeOption}
					toggleOptionCorrect={toggleOptionCorrect}
					updateOptionText={updateOptionText}
					getCorrectAnswersCount={getCorrectAnswersCount}
				/>
			</div>
		</Card>
	);
}