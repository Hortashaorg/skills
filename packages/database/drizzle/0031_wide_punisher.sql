ALTER TYPE "public"."suggestion_type" ADD VALUE 'create_ecosystem';--> statement-breakpoint
ALTER TYPE "public"."suggestion_type" ADD VALUE 'add_ecosystem_package';--> statement-breakpoint
ALTER TABLE "suggestions" ALTER COLUMN "package_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "suggestions" ADD COLUMN "ecosystem_id" uuid;--> statement-breakpoint
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_ecosystem_id_ecosystems_id_fk" FOREIGN KEY ("ecosystem_id") REFERENCES "public"."ecosystems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_suggestions_ecosystem_id" ON "suggestions" USING btree ("ecosystem_id");