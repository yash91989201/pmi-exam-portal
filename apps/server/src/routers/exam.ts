import { ORPCError } from "@orpc/server";
import { count } from "drizzle-orm";
import z from "zod";
import { exam, option, question } from "@/db/schema";
import { adminProcedure } from "@/lib/orpc";
import {
	BulkUploadExcelOutput,
	CreateExamInput,
	CreateExamOutput,
} from "@/lib/schema";
import { importExcelData } from "@/utils/excel-import";

// Add zod schemas for input/output
const ListExamsInput = z.object({
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(10),
});
const ExamRow = z.object({
	id: z.string(),
	certification: z.string(),
	mark: z.number(),
	timeLimit: z.number(),
});
const ListExamsOutput = z.object({
	total: z.number(),
	page: z.number(),
	pageSize: z.number(),
	exams: z.array(ExamRow),
});

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
							timeLimit: input.timeLimit,
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
						timeLimit: result.timeLimit,
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

	bulkUploadExcel: adminProcedure
		.input(
			z.object({
				file: z.instanceof(File),
			}),
		)
		.output(BulkUploadExcelOutput)
		.handler(async ({ input }) => {
			try {
				const buffer = await input.file.arrayBuffer();
				const result = await importExcelData(buffer, input.file.name);

				if (result.success) {
					return {
						success: true,
						message: `Successfully processed ${result.data?.length || 0} questions from Excel file`,
						data: result.data,
					};
				}

				return {
					success: false,
					message: result.error || "Failed to process Excel file",
					validationErrors: result.validationErrors,
				};
			} catch (error) {
				throw new ORPCError(
					error instanceof Error
						? error.message
						: "Failed to process Excel file",
					{ status: 400 },
				);
			}
		}),

	listExams: adminProcedure
		.input(ListExamsInput)
		.output(ListExamsOutput)
		.handler(async ({ context, input }) => {
			const { page, pageSize } = input;
			const offset = (page - 1) * pageSize;

			const [totalResult] = await context.db
				.select({ count: count() })
				.from(exam);

			const total = Number(totalResult.count);

			const examsRows = await context.db
				.select()
				.from(exam)
				.offset(offset)
				.limit(pageSize);
			return {
				total,
				page,
				pageSize,
				exams: examsRows,
			};
		}),
};
