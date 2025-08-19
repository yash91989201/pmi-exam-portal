import { createSelectSchema } from "drizzle-zod";
import z from "zod";
import { exam, option, question, userExam } from "../../db/schema";

export const OptionSchema = createSelectSchema(option);
export const QuestionSchema = createSelectSchema(question);
export const ExamSchema = createSelectSchema(exam);
export const UserExamSchema = createSelectSchema(userExam);

export const GetExamForAttemptInput = z.object({
	examId: z.cuid2(),
});

export const GetExamForAttemptOutput = ExamSchema.extend({
	questions: z.array(
		QuestionSchema.extend({
			options: z.array(OptionSchema.omit({ isCorrect: true })),
		}),
	),
});

export const SubmitExamInput = z.object({
	examId: z.cuid2(),
	answers: z.array(
		z.object({
			questionId: z.cuid2(),
			optionId: z.cuid2().optional(),
		}),
	),
});

export const TerminateExamInput = z.object({
	examId: z.cuid2(),
	reason: z.string(),
});

export const SubmitExamOutput = z.object({
	success: z.boolean(),
	message: z.string(),
});

export const ListExamsInput = z.object({
	page: z.number().min(1).default(1).catch(1),
	limit: z.number().min(1).max(20).default(10).catch(10),
	filter: z
		.object({
			attemptCount: z.number().int().optional(),
		})
		.optional(),
});

export const UpdateExamsAssignedStatusInput = z.object({
	userId: z.string(),
	examsAssignedStatus: z
		.array(
			z.object({
				examId: z.cuid2("Invalid exam ID format"),
				assigned: z.boolean(),
			}),
		)
		.min(1, "At least one exam must be provided"),
});

export const UpdateExamsAssignedStatusOutput = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z
		.array(
			z.object({
				examId: z.cuid2(),
				assigned: z.boolean(),
			}),
		)
		.optional(),
});

export const GetExamsAssignedStatusInput = z.object({
	userId: z.string(),
});

export const GetExamsAssignedStatusOutput = z.object({
	examsAssignedStatus: z.array(
		z.object({
			examId: z.cuid2("Invalid exam ID format"),
			examCertification: z.string(),
			assigned: z.boolean(),
		}),
	),
});

export const ListExamsOutput = z.object({
	exams: z.array(ExamSchema),
	page: z.number(),
	totalPages: z.number(),
	totalCount: z.number(),
	hasPreviousPage: z.boolean().default(false),
	hasNextPage: z.boolean().default(false),
});

const CreateOptionSchema = z.object({
	text: z.string().min(1, "Option text is required"),
	isCorrect: z.boolean().default(false),
	order: z.number().int().min(0),
});

const CreateQuestionSchema = z.object({
	text: z.string().min(1, "Question text is required"),
	mark: z.number().int().positive("Mark must be a positive integer"),
	order: z.number().int().min(0),
	imageId: z.string().optional(),
	options: z
		.array(CreateOptionSchema)
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
	timeLimit: z.number().int().positive("Time limit must be a positive integer"),
	questions: z
		.array(CreateQuestionSchema)
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
			timeLimit: z.number(),
		})
		.optional(),
});

export const GetUserExamsDataInput = z.object({
	userId: z.string(),
});

export const GetUserExamsDataOutput = z.object({
	userExamsData: z.array(
		UserExamSchema.extend({
			exam: ExamSchema,
		}),
	),
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
	"Correct Answer": z.enum(["A", "B", "C", "D", "E", "F"]),
	Marks: z.union([
		z.number().int().positive("Marks must be a positive integer"),
		z.string().transform((val, ctx) => {
			const parsed = Number.parseInt(val.toString(), 10);
			if (Number.isNaN(parsed) || parsed <= 0) {
				ctx.addIssue({
					code: "custom",
					message: "Marks must be a positive integer",
				});
				return z.NEVER;
			}
			return parsed;
		}),
	]),
});

export const ExcelImportSchema = z
	.array(ExcelQuestionRowSchema)
	.min(1, "At least one question is required")
	.refine((rows) => {
		return rows.every((row) => {
			// Count non-empty options
			const options = [
				row["Option A"],
				row["Option B"],
				row["Option C"],
				row["Option D"],
				row["Option E"],
				row["Option F"],
			];
			const nonEmptyOptions = options.filter(
				(opt) => opt && opt.trim().length > 0,
			);

			// Must have at least 2 options
			if (nonEmptyOptions.length < 2) {
				return false;
			}

			// Correct answer must correspond to a non-empty option
			const correctIndex = row["Correct Answer"].charCodeAt(0) - 65; // A=0, B=1, etc.
			return (
				correctIndex < nonEmptyOptions.length &&
				options[correctIndex] &&
				options[correctIndex].trim().length > 0
			);
		});
	}, "Each question must have at least 2 options and the correct answer must correspond to a valid option");

export const BulkUploadExcelOutput = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z.array(QuestionSchema).optional(),
	validationErrors: z.array(z.string()).optional(),
});

export { CreateQuestionSchema, CreateOptionSchema, ExcelQuestionRowSchema };

export const IncreaseExamAttemptsInput = z.object({
	userExamId: z.cuid2(),
});

export const IncreaseExamAttemptsOutput = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z
		.object({
			userExamId: z.cuid2(),
			maxAttempts: z.number().int().positive(),
		})
		.optional(),
});
