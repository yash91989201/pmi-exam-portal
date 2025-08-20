import z from "zod";

const OptionSchema = z.object({
	text: z.string().min(1, "Option text is required"),
	isCorrect: z.boolean(),
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

export const CreateExamFormSchema = z.object({
	certification: z.string().min(1, "Certification is required"),
	mark: z.number().int().nonnegative("Mark must be a non-negative integer"),
	timeLimit: z
		.number()
		.int()
		.positive("Time limit must be a positive integer")
		.min(15)
		.max(60),
	questions: z
		.array(QuestionSchema)
		.min(1, "At least one question is required")
		.refine((questions) => {
			const totalQuestionMarks = questions.reduce((sum, q) => sum + q.mark, 0);
			return totalQuestionMarks > 0;
		}, "Total question marks must be greater than 0"),
	formState: z.object({
		defaultMarks: z
			.number()
			.int()
			.positive("Default mark must be a positive integer"),
		selectedQuestionIndex: z.number().int(),
	}),
});

export type CreateExamFormSchemaType = z.infer<typeof CreateExamFormSchema>;
export type QuestionFormSchemaType = z.infer<typeof QuestionSchema>;
export type OptionFormSchemaType = z.infer<typeof OptionSchema>;
