import z from "zod";

const OptionSchema = z.object({
	text: z.string().min(1, "Option text is required"),
	isCorrect: z.boolean().default(false),
	order: z.number().int().min(0),
});

const QuestionSchema = z.object({
	text: z.string().min(1, "Question text is required"),
	mark: z.number().int().positive("Mark must be a positive integer"),
	order: z.number().int().min(0),
	imageId: z.string().optional(),
	options: z
		.array(OptionSchema)
		.min(2, "At least 2 options are required")
		.max(6, "Maximum 6 options allowed")
		.refine(
			(options) => options.filter((option) => option.isCorrect).length === 1,
			"Exactly one option must be marked as correct",
		),
});

export const CreateExamInput = z.object({
	certification: z.string().min(1, "Certification is required"),
	mark: z.number().int().positive("Mark must be a positive integer"),
	questions: z
		.array(QuestionSchema)
		.min(1, "At least one question is required")
		.refine((questions) => {
			const totalQuestionMarks = questions.reduce((sum, q) => sum + q.mark, 0);
			return totalQuestionMarks > 0;
		}, "Total question marks must be greater than 0"),
});

export const CreateExamOutput = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z
		.object({
			id: z.string(),
			certification: z.string(),
			mark: z.number(),
		})
		.optional(),
});

export type ExamFormData = z.infer<typeof CreateExamInput>;
export type QuestionFormData = z.infer<typeof QuestionSchema>;
export type OptionFormData = z.infer<typeof OptionSchema>;
