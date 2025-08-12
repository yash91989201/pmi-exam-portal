import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFormContext } from "./form-context";

interface ExamInformationProps {
	defaultMark: number;
	setDefaultMark: (mark: number) => void;
	questionsLength: number;
}

export function ExamInformation({ defaultMark, setDefaultMark, questionsLength }: ExamInformationProps) {
	const form = useFormContext();

	return (
		<Card className="overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-slate-800/80">
			<div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
				<h2 className="text-xl font-semibold text-white">Exam Information</h2>
			</div>
			<div className="p-6">
				<form.Field name="certification">
					{(field: any) => (
						<div className="space-y-2">
							<Label htmlFor="certification" className="text-base font-medium">
								Certification Name *
							</Label>
							<Input
								id="certification"
								placeholder="e.g., PMP, CAPM, PMI-ACP"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								className={cn(
									"text-base transition-all",
									field.state.meta.errors?.length &&
										"border-destructive focus-visible:ring-destructive"
								)}
							/>
							{field.state.meta.errors?.length > 0 && (
								<p className="text-destructive text-sm">
									{field.state.meta.errors.join(", ")}
								</p>
							)}
						</div>
					)}
				</form.Field>

				<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="defaultMark" className="text-base font-medium">
							Default Mark per Question
						</Label>
						<Input
							id="defaultMark"
							type="number"
							min="1"
							max="10"
							value={defaultMark}
							onChange={(e) => setDefaultMark(Number(e.target.value) || 1)}
							className="text-base"
						/>
					</div>
					<div className="space-y-2">
						<Label className="text-base font-medium">Estimated Duration</Label>
						<div className="flex items-center space-x-2 rounded-md border border-input px-3 py-2 text-base">
							<span className="text-muted-foreground">
								~{Math.ceil(questionsLength * 1.5)} minutes
							</span>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}