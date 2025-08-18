import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { UpdateExamsAssignedStatusInput } from "@server-schemas/exam";
import type { UpdateExamsAssignementStatusInputType } from "@server-types/index";
import { useMutation } from "@tanstack/react-query";
import { BookOpen, Check, X } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { queryClient, queryUtils } from "@/utils/orpc";

export const UpdateExamsAssignmentForm = ({
	userId,
	examsAssignedStatus,
}: {
	userId: string;
	examsAssignedStatus: {
		examId: string;
		examCertification: string;
		assigned: boolean;
	}[];
}) => {
	const form = useForm<UpdateExamsAssignementStatusInputType>({
		resolver: standardSchemaResolver(UpdateExamsAssignedStatusInput),
		defaultValues: {
			userId,
			examsAssignedStatus: examsAssignedStatus.map(({ examId, assigned }) => ({
				examId,
				assigned,
			})),
		},
	});

	const { mutateAsync: updateExamsAssignmentStatusMutation, isPending } =
		useMutation(
			queryUtils.admin.updateExamsAssignedStatus.mutationOptions({
				onSuccess: (data) => {
					toast.success(data.message);

					queryClient.invalidateQueries(
						queryUtils.exam.getExamsAssignedStatus.queryOptions({
							input: { userId },
						}),
					);
				},
				onError: (error) => {
					toast.error(error.message || "Failed to update exam assignments");
				},
			}),
		);

	const onSubmit: SubmitHandler<UpdateExamsAssignementStatusInputType> = async (
		formData,
	) => {
		try {
			await updateExamsAssignmentStatusMutation(formData);
		} catch {
			// Error handling is done in onError callback
		}
	};

	const handleExamToggle = (examId: string, checked: boolean) => {
		const currentValues = form.getValues("examsAssignedStatus");
		const updatedValues = currentValues.map((item) =>
			item.examId === examId ? { ...item, assigned: checked } : item,
		);
		form.setValue("examsAssignedStatus", updatedValues);
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-medium text-lg">Exam Assignments</h3>
				<p className="text-muted-foreground text-sm">
					Click on exam cards to assign or unassign exams for this user.
				</p>
			</div>

			<Separator />

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{examsAssignedStatus.map((exam, index) => (
							<FormField
								key={exam.examId}
								control={form.control}
								name={`examsAssignedStatus.${index}.assigned`}
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Card
												className={cn(
													"group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
													field.value
														? "border-green-500 bg-green-50 shadow-green-100 shadow-lg ring-2 ring-green-200 dark:bg-green-950/20 dark:shadow-green-950/20 dark:ring-green-800"
														: "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-600",
													isPending &&
														"cursor-not-allowed opacity-60 hover:scale-100",
												)}
												onClick={() => {
													if (!isPending) {
														const newValue = !field.value;
														field.onChange(newValue);
														handleExamToggle(exam.examId, newValue);
													}
												}}
											>
												<CardContent className="p-5">
													<div className="flex flex-col space-y-3">
														{/* Header with icon and status indicator */}
														<div className="flex items-center justify-between">
															<div
																className={cn(
																	"flex h-10 w-10 items-center justify-center rounded-full transition-colors",
																	field.value
																		? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
																		: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
																)}
															>
																<BookOpen className="h-5 w-5" />
															</div>
															<div
																className={cn(
																	"flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200",
																	field.value
																		? "border-green-500 bg-green-500 text-white shadow-md"
																		: "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800",
																)}
															>
																{field.value ? (
																	<Check className="h-4 w-4" />
																) : (
																	<X className="h-4 w-4 text-gray-400 dark:text-gray-500" />
																)}
															</div>
														</div>

														{/* Exam details */}
														<div className="space-y-2">
															<h4
																className={cn(
																	"line-clamp-2 font-semibold text-sm leading-tight",
																	field.value
																		? "text-green-900 dark:text-green-100"
																		: "text-gray-900 dark:text-gray-100",
																)}
															>
																{exam.examCertification}
															</h4>
															<p
																className={cn(
																	"font-mono text-xs",
																	field.value
																		? "text-green-600 dark:text-green-400"
																		: "text-gray-500 dark:text-gray-400",
																)}
															>
																ID: {exam.examId}
															</p>
														</div>

														{/* Status badge */}
														<div className="border-gray-100 border-t pt-2 dark:border-gray-800">
															<div
																className={cn(
																	"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-xs transition-colors",
																	field.value
																		? "border border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
																		: "border border-gray-200 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400",
																)}
															>
																{field.value ? (
																	<>
																		<Check className="h-3 w-3" />
																		Assigned
																	</>
																) : (
																	<>
																		<X className="h-3 w-3" />
																		Not Assigned
																	</>
																)}
															</div>
														</div>
													</div>
												</CardContent>
											</Card>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}
					</div>

					{examsAssignedStatus.length === 0 && (
						<div className="py-12 text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
								<BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
							</div>
							<h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
								No exams available
							</h4>
							<p className="text-gray-500 text-sm dark:text-gray-400">
								There are no exams available to assign to this user.
							</p>
						</div>
					)}

					{/* Summary section */}
					{examsAssignedStatus.length > 0 && (
						<div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-600 dark:text-gray-400">
									Total exams: {examsAssignedStatus.length}
								</span>
								<span className="text-gray-600 dark:text-gray-400">
									Assigned:{" "}
									{form
										.watch("examsAssignedStatus")
										?.filter((exam) => exam.assigned).length || 0}
								</span>
							</div>
						</div>
					)}

					<div className="flex justify-end space-x-3 border-gray-200 border-t pt-4 dark:border-gray-800">
						<Button
							type="button"
							variant="outline"
							onClick={() => form.reset()}
							disabled={isPending}
							className="min-w-24"
						>
							Reset
						</Button>
						<Button type="submit" disabled={isPending} className="min-w-32">
							{isPending ? "Updating..." : "Update Assignments"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
};
