import type { z } from "zod";
import type {
	CreateExamInput,
	ExcelImportSchema,
	ExcelQuestionRowSchema,
	GetExamForAttemptOutput,
	GetUserExamsDataInput,
	GetUserExamsDataOutput,
	OptionSchema,
	QuestionSchema,
	SubmitExamInput,
	TerminateExamInput,
} from "../schema";

export type GetExamForAttemptOutputType = z.infer<
	typeof GetExamForAttemptOutput
>;
export type SubmitExamInputType = z.infer<typeof SubmitExamInput>;
export type TerminateExamInputType = z.infer<typeof TerminateExamInput>;
export type ExamFormData = z.infer<typeof CreateExamInput>;
export type QuestionFormData = z.infer<typeof QuestionSchema>;
export type OptionFormData = z.infer<typeof OptionSchema>;
export type ExcelQuestionRowType = z.infer<typeof ExcelQuestionRowSchema>;
export type ExcelImportType = z.infer<typeof ExcelImportSchema>;
export type GetUserExamsDataOutputType = z.infer<typeof GetUserExamsDataOutput>;
export type GetUserExamsDataInputType = z.infer<typeof GetUserExamsDataInput>;
