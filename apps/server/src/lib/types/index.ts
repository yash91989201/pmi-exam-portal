export type * from "./auth";

import type z from "zod";
import type { ExamSchema } from "@/lib/schema/exam";

export type ExamType = z.infer<typeof ExamSchema>;
