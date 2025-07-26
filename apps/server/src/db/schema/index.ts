import { pgTable, smallint, text, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export * from "./auth";

export const exam = pgTable("exam", {
  id: varchar({ length: 32 }).primaryKey(),
  certification: text().notNull(),
  mark: smallint().notNull(),
})

export const question = pgTable("question", {
  id: varchar({ length: 32 }).primaryKey(),
  text: text().notNull(),
  mark: smallint().notNull(),
  order: smallint().notNull(),
  imageDriveId: varchar({ length: 128 }).notNull(),
  examId: varchar({ length: 32 }).notNull().references(() => exam.id, {
    onDelete: "cascade",
  }),
});

export const option = pgTable("option", {
  id: varchar({ length: 32 }).primaryKey(),
  text: text().notNull(),
  isCorrect: smallint().notNull(),
  questionId: varchar({ length: 32 }).notNull().references(() => question.id, {
    onDelete: "cascade",
  }),
});

// Relations
export const examRelations = relations(exam, ({ many }) => ({
  questions: many(question),
}));

export const questionRelations = relations(question, ({ one, many }) => ({
  exam: one(exam, {
    fields: [question.examId],
    references: [exam.id],
  }),
  options: many(option),
}));

export const optionRelations = relations(option, ({ one }) => ({
  question: one(question, {
    fields: [option.questionId],
    references: [question.id],
  }),
}));
