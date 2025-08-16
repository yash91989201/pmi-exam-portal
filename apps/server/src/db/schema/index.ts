import { cuid2 } from "drizzle-cuid2/postgres";
import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	smallint,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const exam = pgTable("exam", {
	id: cuid2("id").defaultRandom().primaryKey(),
	certification: text("certification").notNull(),
	mark: smallint("mark").notNull(),
	timeLimit: smallint("time_limit").notNull().default(60),
});

export const question = pgTable("question", {
	id: cuid2("id").defaultRandom().primaryKey(),
	text: text("text").notNull(),
	mark: smallint("mark").notNull(),
	order: smallint("order").notNull(),
	imageId: varchar("image_id", { length: 255 }),
	examId: cuid2("exam_id")
		.notNull()
		.references(() => exam.id),
});

export const option = pgTable("option", {
	id: cuid2("id").defaultRandom().primaryKey(),
	text: text("text").notNull(),
	isCorrect: boolean("is_correct").notNull(),
	order: smallint("order").notNull(),
	questionId: cuid2("question_id")
		.notNull()
		.references(() => question.id),
});

export const userExam = pgTable("user_exam", {
	id: cuid2("id").defaultRandom().primaryKey(),
	userId: cuid2("user_id")
		.notNull()
		.references(() => user.id),
	examId: cuid2("exam_id")
		.notNull()
		.references(() => exam.id),
	assignedAt: timestamp("assigned_at").notNull().defaultNow(),
	startedAt: timestamp("started_at"),
	completedAt: timestamp("completed_at"),
	status: text("status").notNull().default("assigned"), // assigned, in_progress, completed, abandoned
	score: integer("score"),
	maxScore: integer("max_score"),
	timeSpent: integer("time_spent"), // in minutes
	attempts: smallint("attempts").notNull().default(1),
	maxAttempts: smallint("max_attempts").notNull().default(1),
});

export const adminSetting = pgTable("admin_setting", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
});

export const examRelations = relations(exam, ({ many }) => ({
	questions: many(question),
	userExams: many(userExam),
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

export const userExamRelations = relations(userExam, ({ one }) => ({
	exam: one(exam, {
		fields: [userExam.examId],
		references: [exam.id],
	}),
}));
