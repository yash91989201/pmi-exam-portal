CREATE TYPE "public"."status" AS ENUM('assigned', 'in_progress', 'completed', 'terminated', 'aborted', 'started');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"orderText" varchar(255) NOT NULL,
	"orderPriority" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userOrders" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL,
	"orderId" varchar(32) NOT NULL,
	"orderText" varchar(255) NOT NULL,
	"orderPriority" smallint DEFAULT 0 NOT NULL,
	"isCompleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exam_attempt" ALTER COLUMN "status" SET DEFAULT 'assigned'::"public"."status";--> statement-breakpoint
ALTER TABLE "exam_attempt" ALTER COLUMN "status" SET DATA TYPE "public"."status" USING "status"::"public"."status";--> statement-breakpoint
ALTER TABLE "userOrders" ADD CONSTRAINT "userOrders_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userOrders" ADD CONSTRAINT "userOrders_orderId_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;