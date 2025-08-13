import { ArrowDown, ArrowUp, ListChecks, Target, Trophy } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ExamFormSchemaType } from "@/lib/schema/exam";

export const ExamInfoCard = () => {
	const form = useFormContext<ExamFormSchemaType>();
	const watchedQuestions = form.watch("questions") || [];

	const totalMarks = watchedQuestions.reduce(
		(total, question) => total + (question.mark || 0),
		0,
	);
	const totalQuestions = watchedQuestions.length;
	const marksArray = watchedQuestions.map((q) => q.mark ?? 0);
	const lowestMark = marksArray.length ? Math.min(...marksArray) : 0;
	const highestMark = marksArray.length ? Math.max(...marksArray) : 0;

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
				<FormField
					control={form.control}
					name="certification"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Certification Name</FormLabel>
							<FormControl>
								<Input
									placeholder="e.g., Project Management Professional (PMP)"
									{...field}
									autoFocus
								/>
							</FormControl>
							<FormDescription>
								Set up the basic details for your PMI certification exam
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="timeLimit"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Time Limit (minutes)</FormLabel>
							<FormControl>
								<Input type="number" min={1} step={1} placeholder="60" {...field} />
							</FormControl>
							<FormDescription>
								Duration of the exam in minutes
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex flex-wrap items-center gap-3 sm:gap-4">
					<Badge
						variant="secondary"
						className="gap-2 border-blue-500/20 bg-blue-500/10 px-3 py-1 text-blue-600 dark:text-blue-400"
					>
						<ListChecks className="size-3.5" />
						<span>Total Questions:</span>
						<strong className="ml-1">{totalQuestions}</strong>
					</Badge>
					<Badge
						variant="secondary"
						className="gap-2 border-primary/20 bg-primary/10 px-3 py-1 text-primary"
					>
						<Trophy className="size-3.5" />
						<span>Total Marks:</span>
						<strong className="ml-1">{totalMarks}</strong>
					</Badge>
					<Badge
						variant="secondary"
						className="gap-2 border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-400"
					>
						<ArrowUp className="size-3.5" />
						<span>Highest Mark:</span>
						<strong className="ml-1">{highestMark}</strong>
					</Badge>
					<Badge
						variant="secondary"
						className="gap-2 border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-700 dark:text-amber-400"
					>
						<ArrowDown className="size-3.5" />
						<span>Lowest Mark:</span>
						<strong className="ml-1">{lowestMark}</strong>
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
};
