CREATE TABLE "admin_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer,
	"admin_name" text NOT NULL,
	"admin_email" text NOT NULL,
	"action" text NOT NULL,
	"target" text,
	"details" text,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_logs_created_idx" ON "admin_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "admin_logs_admin_idx" ON "admin_logs" USING btree ("admin_id");