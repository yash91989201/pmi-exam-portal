import { AlertCircle, BookOpen, Hash, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "@/lib/form-context";
import { cn } from "@/lib/utils";

export function BasicInformation() {
	const form = useFormContext();

	return (
		<Card className="border-0 bg-gradient-to-br from-background to-muted/30 shadow-lg">
			<CardHeader className="pb-6">
				<div className="flex items-center gap-4">
					<div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-3 shadow-md">
						<Target className="h-6 w-6 text-primary-foreground" />
					</div>
					<div>
						<CardTitle className="font-bold text-2xl">
							Exam Information
						</CardTitle>
						<p className="mt-2 text-muted-foreground">
							Set up the basic details for your PMI certification exam
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-8">
				<form.Field name="certification">
					{(field) => (
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<Label
									htmlFor="certification"
									className="font-semibold text-base"
								>
									Certification Name
								</Label>
							</div>
							<div className="relative">
								<div className="absolute top-4 left-4 text-muted-foreground">
									<BookOpen size={20} strokeWidth={2} />
								</div>
								<Input
									id="certification"
									placeholder="e.g., Project Management Professional (PMP)"
									type="text"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									className={cn(
										"h-14 border-0 bg-background/80 pr-4 pl-12 font-medium text-base shadow-sm transition-all focus:bg-background focus:shadow-md",
										field.state.meta.errors?.length &&
											"border border-destructive focus-visible:ring-destructive",
									)}
									autoComplete="off"
									required
									autoFocus
								/>
							</div>
							{field.state.meta.errors?.length > 0 && (
								<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
									<p className="flex items-center gap-2 font-medium text-destructive text-sm">
										<AlertCircle className="h-4 w-4" />
										{field.state.meta.errors.join(", ")}
									</p>
								</div>
							)}
						</div>
					)}
				</form.Field>

				<form.Field name="questions">
					{(field) => {
						const totalMarks = field.state.value.reduce(
							(sum, question) => sum + (question.mark || 0),
							0,
						);
						return (
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<Label className="font-semibold text-base">Total Marks</Label>
								</div>
								<div className="flex items-center gap-6">
									<div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-sm">
										<div className="flex items-center gap-3">
											<div className="rounded-lg bg-primary/20 p-2">
												<Trophy className="h-6 w-6 text-primary" />
											</div>
											<div>
												<div className="flex items-baseline gap-2">
													<span className="font-bold text-3xl text-primary">
														{totalMarks}
													</span>
													<span className="font-medium text-muted-foreground">
														marks
													</span>
												</div>
												<p className="mt-1 text-muted-foreground text-sm">
													Total exam score
												</p>
											</div>
										</div>
									</div>
									<div className="rounded-lg border bg-muted/50 px-4 py-3">
										<div className="flex items-center gap-2 text-muted-foreground text-sm">
											<Hash className="h-4 w-4" />
											<span>
												Based on {field.state.value.length} question
												{field.state.value.length !== 1 ? "s" : ""}
											</span>
										</div>
									</div>
								</div>
							</div>
						);
					}}
				</form.Field>
			</CardContent>
		</Card>
	);
}
