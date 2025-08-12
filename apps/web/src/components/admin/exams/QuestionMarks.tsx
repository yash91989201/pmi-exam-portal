import { AlertCircle, Hash, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useFormContext } from "@/lib/form-context";

interface QuestionMarksProps {
	selectedQuestionIndex: number;
}

export function QuestionMarks({ selectedQuestionIndex }: QuestionMarksProps) {
	const form = useFormContext();

	return (
		<form.Field name={`questions[${selectedQuestionIndex}].mark`}>
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
								const currentMark = markField.state.value || 1;
								if (currentMark > 1) {
									markField.handleChange(currentMark - 1);
								}
							}}
							disabled={(markField.state.value || 1) <= 1}
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
								{(markField.state.value || 1) !== 1 ? "s" : ""}
							</span>
						</div>
						<Button
							type="button"
							variant="outline"
							size="lg"
							onClick={() => {
								const currentMark = markField.state.value || 1;
								markField.handleChange(currentMark + 1);
							}}
							className="h-12 w-12 rounded-xl border-2 shadow-sm transition-all hover:shadow-md"
						>
							<Plus className="h-4 w-4" />
						</Button>
					</div>
					{markField.state.meta.errors?.length > 0 && (
						<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
							<p className="flex items-center gap-2 font-medium text-destructive text-sm">
								<AlertCircle className="h-4 w-4" />
								{markField.state.meta.errors.join(", ")}
							</p>
						</div>
					)}
				</div>
			)}
		</form.Field>
	);
}
