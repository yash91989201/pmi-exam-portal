CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"role" text DEFAULT 'user',
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "admin_setting" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempt_response" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"user_exam_id" varchar(24) NOT NULL,
	"question_id" varchar(24) NOT NULL,
	"option_id" varchar(24),
	"score" smallint DEFAULT 0 NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"certification" text NOT NULL,
	"mark" smallint NOT NULL,
	"time_limit" smallint DEFAULT 60 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_attempt" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"user_exam_id" varchar(24) NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"status" text DEFAULT 'assigned' NOT NULL,
	"marks" integer,
	"attempt_number" smallint DEFAULT 1 NOT NULL,
	"time_spent" integer
);
--> statement-breakpoint
CREATE TABLE "option" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"order" smallint NOT NULL,
	"question_id" varchar(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"mark" smallint NOT NULL,
	"order" smallint NOT NULL,
	"image_id" varchar(255),
	"exam_id" varchar(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_exam" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"user_id" varchar(24) NOT NULL,
	"exam_id" varchar(24) NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"attempts" smallint DEFAULT 1 NOT NULL,
	"max_attempts" smallint DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_response" ADD CONSTRAINT "attempt_response_user_exam_id_user_exam_id_fk" FOREIGN KEY ("user_exam_id") REFERENCES "public"."user_exam"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_response" ADD CONSTRAINT "attempt_response_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_response" ADD CONSTRAINT "attempt_response_option_id_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."option"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_attempt" ADD CONSTRAINT "exam_attempt_user_exam_id_user_exam_id_fk" FOREIGN KEY ("user_exam_id") REFERENCES "public"."user_exam"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option" ADD CONSTRAINT "option_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_exam" ADD CONSTRAINT "user_exam_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_exam" ADD CONSTRAINT "user_exam_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE no action ON UPDATE no action;