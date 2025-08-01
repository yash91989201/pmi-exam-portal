import { relations } from "drizzle-orm";
import { pgTable, smallint, text, varchar } from "drizzle-orm/pg-core";

export const exam = pgTable("exam", {
	id: varchar("id", { length: 32 }).primaryKey(),
	certification: text("certification").notNull(),
	mark: smallint("mark").notNull(),
});

export const question = pgTable("question", {
	id: varchar("id", { length: 32 }).primaryKey(),
	text: text("text").notNull(),
	mark: smallint("mark").notNull(),
	order: smallint("order").notNull(),
	imageDriveId: varchar("image_drive_id", { length: 128 }).notNull(),
	examId: varchar("exam_id", { length: 32 })
		.notNull()
		.references(() => exam.id, {
			onDelete: "cascade",
		}),
});

export const option = pgTable("option", {
	id: varchar("id", { length: 32 }).primaryKey(),
	text: text("text").notNull(),
	isCorrect: smallint("is_correct").notNull(),
	questionId: varchar("question_id", { length: 32 })
		.notNull()
		.references(() => question.id, {
			onDelete: "cascade",
		}),
});

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

export const adminSetting = pgTable("admin_setting", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
});
