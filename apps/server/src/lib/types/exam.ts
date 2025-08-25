import type { z } from "zod";
import type {
	AttemptStatusSchema,
	CreateExamInput,
	ExamInsertSchema,
	ExamSchema,
	ExcelImportSchema,
	ExcelQuestionRowSchema,
	GetExamForAttemptInput,
	GetExamForAttemptOutput,
	GetUserExamsDataInput,
	GetUserExamsDataOutput,
	ListExamResultsOutput,
	OptionInsertSchema,
	OptionSchema,
	QuestionInsertSchema,
	QuestionSchema,
	SubmitExamInput,
	SubmitExamOutput,
	TerminateExamInput,
	UserExamSchema,
	UserExamResultSchema,
} from "@/lib/schema/exam";

export type OptionType = z.infer<typeof OptionSchema>;
export type QuestionType = z.infer<typeof QuestionSchema>;
export type ExamType = z.infer<typeof ExamSchema>;
export type UserExamType = z.infer<typeof UserExamSchema>;
export type OptionInsertType = z.infer<typeof OptionInsertSchema>;
export type QuestionInsertType = z.infer<typeof QuestionInsertSchema>;
export type ExamInsertType = z.infer<typeof ExamInsertSchema>;
export type AttemptStatusType = z.infer<typeof AttemptStatusSchema>;

export type GetExamForAttemptInputType = z.infer<typeof GetExamForAttemptInput>;
export type GetExamForAttemptOutputType = z.infer<
	typeof GetExamForAttemptOutput
>;

export type SubmitExamInputType = z.infer<typeof SubmitExamInput>;
export type SubmitExamOutputType = z.infer<typeof SubmitExamOutput>;

export type GetUserExamsDataOutputType = z.infer<typeof GetUserExamsDataOutput>;
export type GetUserExamsDataInputType = z.infer<typeof GetUserExamsDataInput>;

export type TerminateExamInputType = z.infer<typeof TerminateExamInput>;
export type ExamFormData = z.infer<typeof CreateExamInput>;
export type QuestionFormData = Omit<QuestionType, "id" | "examId"> & {
	options: Omit<OptionType, "id" | "questionId">[];
};
export type OptionFormData = z.infer<typeof OptionSchema>;
export type ExcelQuestionRowType = z.infer<typeof ExcelQuestionRowSchema>;
export type ExcelImportType = z.infer<typeof ExcelImportSchema>;
export type UserExamResultType = z.infer<typeof UserExamResultSchema>;
export type ListExamResultsOutputType = z.infer<typeof ListExamResultsOutput>;
