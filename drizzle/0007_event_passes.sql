CREATE TABLE "passes" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"code" text,
	"category" text NOT NULL,
	"submission_id" integer,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"detail" text,
	"institution" text,
	"issued_by" text,
	"emailed_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"checked_in_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "passes_token_unique" UNIQUE("token"),
	CONSTRAINT "passes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "passes" ADD CONSTRAINT "passes_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "passes_submission_idx" ON "passes" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "passes_category_idx" ON "passes" USING btree ("category");