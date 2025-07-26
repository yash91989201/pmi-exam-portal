import { pgTable, smallint, text, varchar } from "drizzle-orm/pg-core";

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
