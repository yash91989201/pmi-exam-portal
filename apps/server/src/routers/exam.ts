import { ORPCError } from "@orpc/server";
import { exam, option, question } from "@/db/schema";
import { adminProcedure } from "@/lib/orpc";
import { CreateExamInput, CreateExamOutput } from "@/lib/schema";

export const examRouter = {
	createExam: adminProcedure
		.input(CreateExamInput)
		.output(CreateExamOutput)
		.handler(async ({ context, input }) => {
			try {
				// Use a database transaction to ensure data consistency
				const result = await context.db.transaction(async (tx) => {
					// Create the exam first
					const [newExam] = await tx
						.insert(exam)
						.values({
							certification: input.certification,
							mark: input.mark,
						})
						.returning();

					// Create questions and options
					for (const questionData of input.questions) {
						const [newQuestion] = await tx
							.insert(question)
							.values({
								text: questionData.text,
								mark: questionData.mark,
								order: questionData.order,
								imageId: questionData.imageId,
								examId: newExam.id,
							})
							.returning();

						// Create options for this question
						if (questionData.options && questionData.options.length > 0) {
							const optionValues = questionData.options.map((optionData) => ({
								text: optionData.text,
								isCorrect: optionData.isCorrect,
								order: optionData.order,
								questionId: newQuestion.id,
							}));

							await tx.insert(option).values(optionValues);
						}
					}

					return newExam;
				});

				return {
					success: true,
					message: "Exam created successfully with questions and options",
					data: {
						id: result.id,
						certification: result.certification,
						mark: result.mark,
					},
				};
			} catch (error) {
				console.error("Error creating exam:", error);
				throw new ORPCError(
					error instanceof Error ? error.message : "Failed to create exam",
					{ status: 500 },
				);
			}
		}),
};
