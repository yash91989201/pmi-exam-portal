import z from "zod";

const OptionSchema = z.object({
	id: z.cuid2(),
	text: z.string().min(1, "Option text is required"),
	isCorrect: z.boolean(),
	order: z.number().int().min(0),
});

const QuestionSchema = z.object({
	id: z.cuid2(),
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

export const ExamFormSchema = z.object({
	id: z.cuid2(),
	certification: z.string().min(1, "Certification is required"),
	// Allow non-negative here because total is derived and starts at 0 before computation
	mark: z.number().int().nonnegative("Mark must be a non-negative integer"),
	questions: z
		.array(QuestionSchema)
		.min(1, "At least one question is required")
		.refine((questions) => {
			const totalQuestionMarks = questions.reduce((sum, q) => sum + q.mark, 0);
			return totalQuestionMarks > 0;
		}, "Total question marks must be greater than 0"),
});

export type ExamFormData = z.infer<typeof ExamFormSchema>;
export type QuestionFormData = z.infer<typeof QuestionSchema>;
export type OptionFormData = z.infer<typeof OptionSchema>;
