export type * from "./auth";

import type z from "zod";
import type { ListUserExamsOutput } from "@/lib/schema";
import type {
	ExamSchema,
	GetUserExamsDataOutput,
	UpdateExamsAssignedStatusInput,
	UserExamSchema,
} from "@/lib/schema/exam";

export type ExamType = z.infer<typeof ExamSchema>;

export type UpdateExamsAssignementStatusInputType = z.infer<
	typeof UpdateExamsAssignedStatusInput
>;

export type UserExamType = z.infer<typeof UserExamSchema>;

export type GetUserExamsDataOutputType = z.infer<typeof GetUserExamsDataOutput>;

export type ListUserExamsOutputType = z.infer<typeof ListUserExamsOutput>;

