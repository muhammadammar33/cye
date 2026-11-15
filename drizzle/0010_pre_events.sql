ALTER TABLE "competitions" ADD COLUMN "pre_event" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "pre_event_result" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "pre_event_absent" jsonb;