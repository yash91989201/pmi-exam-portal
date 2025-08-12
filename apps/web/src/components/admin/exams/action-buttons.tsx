import { Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useFormContext } from "./form-context";
import type { FormSubscriptionState } from './types';

export function ActionButtons() {
	const form = useFormContext();

	return (
		<Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-slate-800/80">
			<div className="p-6">
				<form.Subscribe>
					{({ isSubmitting, canSubmit, errors }: FormSubscriptionState) => (
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										console.log("Preview exam:", form.state.values);
										toast.info("Preview functionality would open here");
									}}
								>
									<Eye className="mr-2 h-4 w-4" />
									Preview Exam
								</Button>
								
								{errors.length > 0 && (
									<div className="text-sm text-destructive">
										Please fix {errors.length} error{errors.length !== 1 ? 's' : ''} before submitting
									</div>
								)}
							</div>

							<Button
								type="submit"
								disabled={isSubmitting || !canSubmit}
								className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8"
							>
								{isSubmitting ? (
									<>
										<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
										Creating Exam...
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										Create Exam
									</>
								)}
							</Button>
						</div>
					)}
				</form.Subscribe>
			</div>
		</Card>
	);
}