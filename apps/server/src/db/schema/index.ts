import { cuid2 } from "drizzle-cuid2/postgres";
import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgEnum,
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
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	examId: cuid2("exam_id")
		.notNull()
		.references(() => exam.id),
	assignedAt: timestamp("assigned_at").notNull().defaultNow(),
	attempts: smallint("attempts").notNull().default(0),
	maxAttempts: smallint("max_attempts").notNull().default(1),
});

export const AttemptStatusEnum = pgEnum("status", [
	"assigned",
	"in_progress",
	"completed",
	"terminated",
	"aborted",
	"started",
]);

export const examAttempt = pgTable("exam_attempt", {
	id: cuid2("id").defaultRandom().primaryKey(),
	userExamId: cuid2("user_exam_id")
		.notNull()
		.references(() => userExam.id, { onDelete: "cascade" }),
	startedAt: timestamp("started_at"),
	completedAt: timestamp("completed_at"),
	status: AttemptStatusEnum().notNull().default("assigned"),
	marks: integer("marks"),
	attemptNumber: smallint("attempt_number").notNull().default(1),
	timeSpent: integer("time_spent"), // in minutes
	terminationReason: text("termination_reason"),
});

export const attemptResponse = pgTable("attempt_response", {
	id: cuid2("id").defaultRandom().primaryKey(),
	userExamId: cuid2("user_exam_id")
		.notNull()
		.references(() => userExam.id, { onDelete: "cascade" }),
	questionId: cuid2("question_id")
		.notNull()
		.references(() => question.id),
	optionId: cuid2("option_id").references(() => option.id),
	score: smallint("score").notNull().default(0),
	isCorrect: boolean("is_correct").notNull().default(false),
});

export const adminSetting = pgTable("admin_setting", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
});

export const orders = pgTable("orders", {
	id: cuid2("id").defaultRandom().primaryKey(),
	orderText: varchar("orderText", { length: 255 }).notNull(),
	orderPriority: smallint("orderPriority").default(0).notNull(),
});

export const userOrders = pgTable("userOrders", {
	id: cuid2("id").defaultRandom().primaryKey(),
	userId: varchar("userId", { length: 32 })
		.notNull()
		.references(() => user.id, {
			onDelete: "cascade",
		}),
	orderId: varchar("orderId", { length: 32 })
		.notNull()
		.references(() => orders.id, {
			onDelete: "cascade",
		}),
	orderText: varchar("orderText", { length: 255 }).notNull(),
	orderPriority: smallint("orderPriority").default(0).notNull(),
	isCompleted: boolean("isCompleted").default(false).notNull(),
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
	attemptResponses: many(attemptResponse),
}));

export const optionRelations = relations(option, ({ one, many }) => ({
	question: one(question, {
		fields: [option.questionId],
		references: [question.id],
	}),
	attemptResponses: many(attemptResponse),
}));

export const userExamRelations = relations(userExam, ({ one, many }) => ({
	exam: one(exam, {
		fields: [userExam.examId],
		references: [exam.id],
	}),
	user: one(user, {
		fields: [userExam.userId],
		references: [user.id],
	}),
	attempts: many(examAttempt),
	responses: many(attemptResponse),
}));

export const examAttemptRelations = relations(examAttempt, ({ one }) => ({
	userExam: one(userExam, {
		fields: [examAttempt.userExamId],
		references: [userExam.id],
	}),
}));

export const attemptResponseRelations = relations(
	attemptResponse,
	({ one }) => ({
		userExam: one(userExam, {
			fields: [attemptResponse.userExamId],
			references: [userExam.id],
		}),
		question: one(question, {
			fields: [attemptResponse.questionId],
			references: [question.id],
		}),
		option: one(option, {
			fields: [attemptResponse.optionId],
			references: [option.id],
		}),
	}),
);

export const orderRelations = relations(orders, ({ many }) => ({
	userOrder: many(userOrders),
}));

export const userOrderRelation = relations(userOrders, ({ one }) => ({
	user: one(user, {
		fields: [userOrders.userId],
		references: [user.id],
	}),
	order: one(orders, {
		fields: [userOrders.orderId],
		references: [orders.id],
	}),
}));
