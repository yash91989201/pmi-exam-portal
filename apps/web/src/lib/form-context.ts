import type { FormApi, ValidationError } from "@tanstack/react-form";
import { createFormHookContexts } from "@tanstack/react-form";

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface Question {
  id?: string;
  text: string;
  mark: number;
  options: Option[];
}

export interface ExamForm {
  certification: string;
  mark: number;
  questions: Question[];
}

export const {
  fieldContext,
  formContext,
  useFieldContext,
  useFormContext,
} = createFormHookContexts<ExamForm>();

export type { ExamForm };

