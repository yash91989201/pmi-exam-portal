export type * from "./auth";

import type z from "zod";
import type {
	ExamSchema,
	UpdateExamsAssignedStatusInput,
} from "@/lib/schema/exam";

export type ExamType = z.infer<typeof ExamSchema>;

export type UpdateExamsAssignementStatusInputType = z.infer<
	typeof UpdateExamsAssignedStatusInput
>;
