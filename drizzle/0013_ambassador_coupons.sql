ALTER TABLE "ambassadors" ADD COLUMN "coupon" text;--> statement-breakpoint
ALTER TABLE "ambassadors" ADD CONSTRAINT "ambassadors_coupon_unique" UNIQUE("coupon");