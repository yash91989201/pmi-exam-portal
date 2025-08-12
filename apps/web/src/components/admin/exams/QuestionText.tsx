import { AlertCircle } from "lucide-react";
import type React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "@/lib/form-context";
import { cn } from "@/lib/utils";

interface QuestionTextProps {
	selectedQuestionIndex: number;
}

export function QuestionText({ selectedQuestionIndex }: QuestionTextProps) {
	const form = useFormContext();

	return (
		<form.Field name={`questions[${selectedQuestionIndex}].text`}>
			{(questionField) => (
				<div className="space-y-4">
					<Label className="font-semibold text-base">Question Text</Label>
					<Textarea
						placeholder="Enter your question here. Be clear and concise..."
						value={questionField.state.value}
						onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
							questionField.handleChange(
								(e.target as HTMLTextAreaElement).value,
							);
						}}
						className={cn(
							"min-h-[120px] resize-none border-0 bg-muted/50 font-medium text-base shadow-sm transition-all focus:bg-background focus:shadow-md",
							questionField.state.meta.errors?.length &&
								"border border-destructive focus-visible:ring-destructive",
						)}
						required
					/>
					{questionField.state.meta.errors?.length > 0 && (
						<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
							<p className="flex items-center gap-2 font-medium text-destructive text-sm">
								<AlertCircle className="h-4 w-4" />
								{questionField.state.meta.errors.join(", ")}
							</p>
						</div>
					)}
				</div>
			)}
		</form.Field>
	);
}
