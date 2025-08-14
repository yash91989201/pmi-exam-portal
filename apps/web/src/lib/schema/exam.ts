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

export const ExamFormSchema = z.object({
	certification: z.string().min(1, "Certification is required"),
	mark: z.number().int().nonnegative("Mark must be a non-negative integer"),
	timeLimit: z
		.number()
		.int()
		.positive("Time limit must be a positive integer"),
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

// Excel import schema for validating uploaded data
const ExcelQuestionRowSchema = z.object({
	"Question Text": z.string().min(1, "Question text is required"),
	"Option A": z.string().min(1, "Option A is required"),
	"Option B": z.string().min(1, "Option B is required"), 
	"Option C": z.string().optional(),
	"Option D": z.string().optional(),
	"Option E": z.string().optional(),
	"Option F": z.string().optional(),
	"Correct Answer": z.enum(["A", "B", "C", "D", "E", "F"], {
		errorMap: () => ({ message: "Correct answer must be A, B, C, D, E, or F" })
	}),
	"Marks": z.union([
		z.number().int().positive("Marks must be a positive integer"),
		z.string().transform((val, ctx) => {
			const parsed = Number.parseInt(val.toString());
			if (Number.isNaN(parsed) || parsed <= 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Marks must be a positive integer"
				});
				return z.NEVER;
			}
			return parsed;
		})
	])
});

export const ExcelImportSchema = z.array(ExcelQuestionRowSchema)
	.min(1, "At least one question is required")
	.refine((rows) => {
		return rows.every((row) => {
			// Count non-empty options
			const options = [row["Option A"], row["Option B"], row["Option C"], row["Option D"], row["Option E"], row["Option F"]];
			const nonEmptyOptions = options.filter(opt => opt && opt.trim().length > 0);
			
			// Must have at least 2 options
			if (nonEmptyOptions.length < 2) {
				return false;
			}
			
			// Correct answer must correspond to a non-empty option
			const correctIndex = row["Correct Answer"].charCodeAt(0) - 65; // A=0, B=1, etc.
			return correctIndex < nonEmptyOptions.length && options[correctIndex] && options[correctIndex].trim().length > 0;
		});
	}, "Each question must have at least 2 options and the correct answer must correspond to a valid option");

export type ExamFormSchemaType = z.infer<typeof ExamFormSchema>;
export type QuestionFormSchemaType = z.infer<typeof QuestionSchema>;
export type OptionFormSchemaType = z.infer<typeof OptionSchema>;
export type ExcelQuestionRowType = z.infer<typeof ExcelQuestionRowSchema>;
export type ExcelImportType = z.infer<typeof ExcelImportSchema>;
