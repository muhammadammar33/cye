CREATE TABLE "ambassadors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"institute" text NOT NULL,
	"role" text NOT NULL,
	"phone" text,
	"photo" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
