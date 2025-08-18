import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { UpdateExamsAssignedStatusInput } from "@server-schemas/exam";
import { useMutation } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { queryClient, queryUtils } from "@/utils/orpc";

type UpdateExamsAssignedStatusInputType = z.infer<
	typeof UpdateExamsAssignedStatusInput
>;

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
	const form = useForm<UpdateExamsAssignedStatusInputType>({
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

	const onSubmit: SubmitHandler<UpdateExamsAssignedStatusInputType> = async (
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
					Assign/unassign exams for the user. Use the checkboxes to select which
					exams the user should have access to.
				</p>
			</div>

			<Separator />

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-4">
						{examsAssignedStatus.map((exam, index) => (
							<FormField
								key={exam.examId}
								control={form.control}
								name={`examsAssignedStatus.${index}.assigned`}
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={(checked) => {
													field.onChange(checked);
													handleExamToggle(exam.examId, checked as boolean);
												}}
												disabled={isPending}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel className="font-medium">
												{exam.examCertification}
											</FormLabel>
											<p className="text-muted-foreground text-xs">
												Exam ID: {exam.examId}
											</p>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}

						{examsAssignedStatus.length === 0 && (
							<div className="py-8 text-center text-muted-foreground">
								No exams available to assign.
							</div>
						)}
					</div>

					<div className="flex justify-end space-x-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => form.reset()}
							disabled={isPending}
						>
							Reset
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Updating..." : "Update Assignments"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
};
