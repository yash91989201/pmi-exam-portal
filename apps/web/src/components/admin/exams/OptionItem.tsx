import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { useFormContext } from "@/lib/form-context";
import { cn } from "@/lib/utils";

interface OptionItemProps {
	selectedQuestionIndex: number;
	optionIndex: number;
	optionId: string;
	isCorrect: boolean;
	canDelete: boolean;
	onCorrectChange: () => void;
	onDelete: () => void;
}

export function OptionItem({
	selectedQuestionIndex,
	optionIndex,
	optionId,
	isCorrect,
	canDelete,
	onCorrectChange,
	onDelete,
}: OptionItemProps) {
	const form = useFormContext();

	return (
		// biome-ignore lint/a11y/useSemanticElements: <cannot use button here>
		<div
			key={optionId}
			role="button"
			tabIndex={0}
			className={cn(
				"flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all hover:shadow-sm",
				isCorrect
					? "border-green-200 bg-green-50"
					: "border-muted-foreground/20 bg-muted/30",
			)}
			onClick={onCorrectChange}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onCorrectChange();
				}
			}}
		>
			<div className="flex h-5 w-5 shrink-0 items-center justify-center">
				{isCorrect && <Check className="h-4 w-4 text-green-600" />}
			</div>
			<RadioGroupItem
				value={optionIndex.toString()}
				id={`q${selectedQuestionIndex}-opt${optionIndex}`}
				className="hidden"
			/>
			<div className="min-w-0 flex-1">
				<form.Field
					name={`questions[${selectedQuestionIndex}].options[${optionIndex}].text`}
				>
					{(optionField) => (
						<Input
							placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
							value={optionField.state.value}
							onChange={(e) => optionField.handleChange(e.target.value)}
							className={cn(
								"h-11 border-0 bg-transparent font-medium shadow-none transition-all focus:shadow-sm focus-visible:bg-background",
								optionField.state.meta.errors?.length &&
									"border border-destructive focus-visible:ring-destructive",
							)}
							required
						/>
					)}
				</form.Field>
			</div>
			{canDelete && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						onDelete();
					}}
					className="h-9 w-9 shrink-0 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
}
