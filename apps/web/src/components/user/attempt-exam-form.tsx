import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { GetExamForAttemptOutputType } from "@server-types/exam";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { AlertTriangle, Check, Clock } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useCheatDetection } from "@/hooks/use-cheat-detection";
import { useExamTimer } from "@/hooks/use-exam-timer";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";

const examAttemptSchema = z.object({
	examId: z.string(),
	answers: z.array(
		z.object({
			questionId: z.string(),
			optionId: z.string().optional(),
		}),
	),
});

type ExamAttemptFormValues = z.infer<typeof examAttemptSchema>;

export function AttemptExamForm({
	examId,
	isImpersonating = false,
}: {
	examId: string;
	isImpersonating?: boolean;
}) {
	const router = useRouter();

	const examSubmitted = useRef(false);

	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [isNavigating, setIsNavigating] = useState(false);

	const { data: examData } = useSuspenseQuery<GetExamForAttemptOutputType>(
		queryUtils.user.getExamForAttempt.queryOptions({
			input: { examId },
		}),
	);

	const form = useForm<ExamAttemptFormValues>({
		resolver: standardSchemaResolver(examAttemptSchema),
		defaultValues: {
			examId,
			answers: examData.questions.map((q) => ({
				questionId: q.id,
				optionId: undefined,
			})),
		},
	});

	const { mutate: submitExam, isPending } = useMutation(
		queryUtils.user.submitExam.mutationOptions({
			onSuccess: () => {
				examSubmitted.current = true;
				toast.success("Exam submitted successfully!");
				router.invalidate();
				router.navigate({ to: "/exams" });
			},
			onError: (error) => {
				toast.error(error.message || "Failed to submit exam.");
			},
		}),
	);

	const { mutate: terminateExam } = useMutation(
		queryUtils.user.terminateExam.mutationOptions({
			onSuccess: () => {
				examSubmitted.current = true;
				toast.error("Exam terminated due to suspicious activity.");
				router.invalidate();
				router.navigate({ to: "/exams" });
			},
			onError: (error) => {
				toast.error(error.message || "Failed to terminate exam.");
			},
		}),
	);

	const {
		isMonitoring,
		warningCount,
		showWarningDialog,
		setIsMonitoring,
		setShowWarningDialog,
	} = useCheatDetection({
		examId,
		examSubmitted,
		onTerminate: terminateExam,
		isImpersonating,
	});

	const handleOptionChange = useCallback(
		(optionId: string) => {
			const answers = form.getValues("answers");
			const updatedAnswers = [...answers];
			updatedAnswers[currentQuestion] = {
				...updatedAnswers[currentQuestion],
				optionId,
			};

			form.setValue("answers", updatedAnswers);

			if (currentQuestion < examData.questions.length - 1) {
				setIsNavigating(true);
				setTimeout(() => {
					setCurrentQuestion((prev) => prev + 1);
					setIsNavigating(false);
				}, 150);
			}
		},
		[form, currentQuestion, examData.questions.length],
	);

	const onSubmit = useCallback(
		(values: ExamAttemptFormValues) => {
			!examSubmitted.current && submitExam(values);
		},
		[submitExam],
	);

	const { timeLeft, formattedTime, timerColor } = useExamTimer(
		examData.timeLimit,
		() => {
			form.handleSubmit(onSubmit)();
		},
	);

	const question = useMemo(
		() => examData.questions[currentQuestion],
		[currentQuestion, examData.questions],
	);

	const answeredQuestions = form
		.watch("answers")
		.filter((a) => a.optionId).length;

	const progressPercentage = useMemo(
		() => ((currentQuestion + 1) / examData.questions.length) * 100,
		[currentQuestion, examData.questions.length],
	);

	const progressColor = useMemo(() => {
		if (progressPercentage < 25) return "bg-red-500";
		if (progressPercentage < 50) return "bg-orange-500";
		if (progressPercentage < 65) return "bg-amber-500";
		if (progressPercentage < 85) return "bg-yellow-500";
		return "bg-green-500";
	}, [progressPercentage]);

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
			<header className="sticky top-0 z-50 border-slate-200 border-b bg-white/90 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/90">
				<div className="container mx-auto py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								{isImpersonating ? (
									<div className="flex items-center space-x-2">
										{/** biome-ignore lint/correctness/useUniqueElementIds: <required here> */}
										<Switch
											id="monitoring-status"
											className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
											checked={isMonitoring}
											onCheckedChange={setIsMonitoring}
										/>
										<Label htmlFor="monitoring-status">
											{isMonitoring
												? "Monitoring Active"
												: "Monitoring Disabled"}
										</Label>
									</div>
								) : (
									<>
										<div className="size-3 animate-pulse rounded-full bg-green-500" />
										<span className="font-medium text-slate-600 text-sm dark:text-slate-400">
											Monitoring Active
										</span>
									</>
								)}
							</div>
							<div className="hidden text-slate-400 md:block">•</div>
							<h1 className="font-bold text-slate-800 text-xl dark:text-slate-200">
								{examData.certification}
							</h1>
						</div>
						<div className="flex items-center space-x-6">
							{warningCount > 0 && (
								<div className="flex items-center space-x-2 rounded-full bg-red-100 px-3 py-1 dark:bg-red-900/30">
									<AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
									<span className="font-medium text-red-700 text-sm dark:text-red-300">
										{warningCount}/2 Warnings
									</span>
								</div>
							)}
							<div className="flex items-center space-x-2">
								<Clock className="h-5 w-5 text-slate-500" />
								<div className={`font-bold text-xl ${timerColor}`}>
									{formattedTime}
								</div>
							</div>
						</div>
					</div>

					<div className="mt-4 space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-slate-600 dark:text-slate-400">
								Question {currentQuestion + 1} of {examData.questions.length}
							</span>
							<span className="text-slate-600 dark:text-slate-400">
								{answeredQuestions} answered •{" "}
								{examData.questions.length - answeredQuestions} remaining
							</span>
						</div>
						<div className="relative">
							<Progress
								value={progressPercentage}
								indicatorClassName={progressColor}
								className="h-3"
							/>
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto py-6">
				<div className="mx-auto grid max-w-9xl grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">
					{/* Enhanced Sidebar */}
					<aside className="hidden lg:block">
						<div className="sticky top-32">
							<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-950">
								<div className="border-slate-200 border-b bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
									<h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
										Questions
									</h3>
									<p className="mt-1 text-slate-600 text-sm dark:text-slate-400">
										{answeredQuestions} of {examData.questions.length} completed
									</p>
								</div>
								<ScrollArea className="h-[calc(100vh-300px)]">
									<div className="space-y-2 p-4">
										{examData.questions.map((q, index) => {
											const isAnswered = form.watch(
												`answers.${index}.optionId`,
											);
											const isCurrent = currentQuestion === index;
											return (
												<Button
													key={q.id}
													variant={isCurrent ? "default" : "ghost"}
													className={cn(
														"h-auto w-full justify-start p-3 text-left transition-all duration-200",
														isCurrent
															? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
															: isAnswered
																? "border border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-800 dark:bg-green-950 dark:hover:bg-green-900"
																: "hover:bg-slate-100 dark:hover:bg-slate-800",
													)}
													onClick={() => setCurrentQuestion(index)}
												>
													<div className="flex w-full items-center justify-between">
														<div className="flex items-center space-x-3">
															<div
																className={cn(
																	"flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold text-sm",
																	isCurrent
																		? "border-white text-white"
																		: isAnswered
																			? "border-green-500 bg-green-500 text-white"
																			: "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400",
																)}
															>
																{isAnswered ? (
																	<Check className="h-4 w-4" />
																) : (
																	index + 1
																)}
															</div>
															<span
																className={cn(
																	"truncate text-sm",
																	isCurrent
																		? "text-white"
																		: "text-slate-700 dark:text-slate-300",
																)}
															>
																{q.text}
															</span>
														</div>
													</div>
												</Button>
											);
										})}
									</div>
								</ScrollArea>
							</div>
						</div>
					</aside>

					{/* Enhanced Main Content */}
					<div className="col-span-1">
						<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-950">
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="flex h-full flex-col"
								>
									{/* Question Header */}
									<div className="border-slate-200 border-b bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-900">
										<div className="mb-4 flex items-center justify-between">
											<h2 className="font-bold text-2xl text-slate-800 dark:text-slate-200">
												Question {currentQuestion + 1}
											</h2>
											<div className="flex items-center space-x-2 text-slate-600 text-sm dark:text-slate-400">
												<span className="rounded-full bg-slate-200 px-3 py-1 dark:bg-slate-700">
													{Math.round(progressPercentage)}% Complete
												</span>
											</div>
										</div>
										<div className="prose max-w-none">
											<p className="text-lg text-slate-700 leading-relaxed dark:text-slate-300">
												{question.text}
											</p>
										</div>
									</div>

									{/* Options Section */}
									<div className="flex-grow p-8">
										<h3 className="mb-6 font-semibold text-slate-800 text-xl dark:text-slate-200">
											Select your answer:
										</h3>
										<FormField
											key={question.id}
											control={form.control}
											name={`answers.${currentQuestion}.optionId`}
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<RadioGroup
															onValueChange={handleOptionChange}
															value={field.value}
															className="space-y-4"
															disabled={isNavigating}
														>
															{question.options.map((option, index) => (
																<FormItem key={option.id}>
																	<FormControl>
																		<RadioGroupItem
																			value={option.id}
																			id={option.id}
																			className="peer sr-only"
																		/>
																	</FormControl>
																	<FormLabel
																		htmlFor={option.id}
																		className={cn(
																			"group flex cursor-pointer items-center space-x-4 rounded-xl border-2 border-slate-200 p-5 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:shadow-md dark:border-slate-700 dark:peer-data-[state=checked]:bg-blue-950/50 dark:hover:border-blue-600 dark:hover:bg-blue-950/30",
																			isNavigating &&
																				"cursor-not-allowed opacity-50",
																		)}
																	>
																		<div
																			className={cn(
																				"flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-300 bg-white font-semibold text-slate-600 transition-all duration-200 group-hover:border-blue-400 group-hover:text-blue-600 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400",
																				isNavigating && "opacity-50",
																			)}
																		>
																			{String.fromCharCode(65 + index)}
																		</div>
																		<span
																			className={cn(
																				"font-medium text-base text-slate-700 leading-relaxed dark:text-slate-300",
																				isNavigating && "opacity-50",
																			)}
																		>
																			{option.text}
																		</span>
																	</FormLabel>
																</FormItem>
															))}
														</RadioGroup>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</form>
							</Form>
						</div>

						{/* Mobile Question Navigation */}
						<div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-lg lg:hidden dark:border-slate-700 dark:bg-slate-950">
							<h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-slate-200">
								Quick Navigation
							</h3>
							<div className="grid grid-cols-5 gap-2">
								{examData.questions.map((_, index) => {
									const isAnswered = form.watch(`answers.${index}.optionId`);
									const isCurrent = currentQuestion === index;
									return (
										<Button
											key={index.toString()}
											variant={isCurrent ? "default" : "ghost"}
											size="sm"
											className={cn(
												"h-10 w-full",
												isCurrent
													? "bg-blue-600 text-white"
													: isAnswered
														? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
														: "",
											)}
											onClick={() => setCurrentQuestion(index)}
										>
											{isAnswered ? <Check className="h-4 w-4" /> : index + 1}
										</Button>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* Enhanced Footer */}
			<footer className="sticky bottom-0 border-slate-200 border-t bg-white/95 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/95">
				<div className="container mx-auto flex items-center justify-between px-6 py-4">
					<div className="flex items-center space-x-4">
						{timeLeft <= 300 && (
							<div className="flex items-center space-x-2 rounded-full bg-red-100 px-3 py-1 dark:bg-red-900/30">
								<AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
								<span className="font-medium text-red-700 text-sm dark:text-red-300">
									Time Running Out!
								</span>
							</div>
						)}
					</div>

					<div className="flex gap-3">
						<Button
							variant="outline"
							onClick={() => setCurrentQuestion((prev) => prev - 1)}
							disabled={currentQuestion === 0}
							className="border-slate-300 px-6 py-2 font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
						>
							Previous
						</Button>
						{currentQuestion < examData.questions.length - 1 ? (
							<Button
								type="button"
								onClick={() => setCurrentQuestion((prev) => prev + 1)}
								className="bg-blue-600 px-6 py-2 font-medium text-white shadow-md hover:bg-blue-700"
							>
								Next Question
							</Button>
						) : (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										type="button"
										className="bg-green-600 px-8 py-2 font-medium text-white shadow-md hover:bg-green-700"
									>
										Submit Exam
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent className="max-w-md">
									<AlertDialogHeader>
										<AlertDialogTitle className="font-bold text-xl">
											Submit Examination
										</AlertDialogTitle>
										<AlertDialogDescription className="text-base leading-relaxed">
											Are you sure you want to submit your exam? You have
											answered{" "}
											<span className="font-semibold text-green-600">
												{answeredQuestions}
											</span>{" "}
											out of{" "}
											<span className="font-semibold">
												{examData.questions.length}
											</span>{" "}
											questions.
											<br />
											<br />
											<span className="font-medium text-red-600 dark:text-red-400">
												You cannot change your answers after submitting.
											</span>
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel className="px-6">
											Review Answers
										</AlertDialogCancel>
										<AlertDialogAction
											onClick={form.handleSubmit(onSubmit)}
											disabled={isPending}
											className="bg-green-600 px-6 hover:bg-green-700"
										>
											{isPending ? "Submitting..." : "Submit Exam"}
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</div>
				</div>
			</footer>

			{/* Warning Dialog */}
			<AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
				<AlertDialogContent className="max-w-md">
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center space-x-2 text-orange-600">
							<AlertTriangle className="h-5 w-5" />
							<span>Suspicious Activity Detected</span>
						</AlertDialogTitle>
						<AlertDialogDescription className="text-base leading-relaxed">
							Warning {warningCount} of 3: Potential cheating behavior has been
							detected.
							<br />
							<br />
							<span className="font-medium text-red-600 dark:text-red-400">
								{warningCount >= 3
									? "Your exam will be automatically terminated if any more violations are detected."
									: "Please stay focused on the exam window. Additional violations may result in automatic termination."}
							</span>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction
							onClick={() => setShowWarningDialog(false)}
							className="w-full"
						>
							I Understand, Continue Exam
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
