import { createId } from "@paralleldrive/cuid2";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { useFormContext } from "@/lib/form-context";
import { OptionItem } from "./OptionItem";

interface OptionsSectionProps {
	selectedQuestionIndex: number;
}

export function OptionsSection({ selectedQuestionIndex }: OptionsSectionProps) {
	const form = useFormContext();

	return (
		<div className="space-y-6">
			<Label className="font-semibold text-base">Answer Options</Label>
			<form.Field name={`questions[${selectedQuestionIndex}].options`}>
				{(optionsField) => (
					<>
						<RadioGroup
							value={optionsField.state.value
								.findIndex((opt) => opt.isCorrect)
								.toString()}
							onValueChange={(value: string) => {
								const optionIndex = Number.parseInt(value, 10);
								const updated = optionsField.state.value.map((opt, i) => ({
									...opt,
									isCorrect: i === optionIndex,
								}));
								optionsField.handleChange(updated);
							}}
							className="space-y-0"
						>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								{optionsField.state.value.map((option, optionIndex) => (
									<OptionItem
										key={option.id}
										selectedQuestionIndex={selectedQuestionIndex}
										optionIndex={optionIndex}
										optionId={option.id}
										isCorrect={option.isCorrect}
										text={option.text}
										canDelete={optionsField.state.value.length > 2}
										onCorrectChange={() => {
											const updated = optionsField.state.value.map(
												(opt, i) => ({
													...opt,
													isCorrect: i === optionIndex,
												}),
											);
											optionsField.handleChange(updated);
										}}
										onDelete={() => {
											const updated = optionsField.state.value.filter(
												(_, i) => i !== optionIndex,
											);
											updated.forEach((opt, i) => {
												opt.order = i;
											});
											if (
												optionsField.state.value[optionIndex]?.isCorrect &&
												updated.length > 0
											) {
												updated[0].isCorrect = true;
											}
											optionsField.handleChange(updated);
										}}
									/>
								))}
								{optionsField.state.value.length < 4 && (
									<button
										type="button"
										onClick={() => {
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
										}}
										className="flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 border-muted-foreground/30 border-dashed bg-muted/20 p-6 text-left transition-all hover:border-primary/30 hover:bg-primary/5"
									>
										<div className="flex h-5 w-5 items-center justify-center">
											<Plus className="h-4 w-4 text-muted-foreground" />
										</div>
										<span className="font-medium text-muted-foreground">
											Add another option
										</span>
									</button>
								)}
							</div>
						</RadioGroup>
					</>
				)}
			</form.Field>
		</div>
	);
}
