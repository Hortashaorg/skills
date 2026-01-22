ALTER TYPE "public"."suggestion_type" ADD VALUE 'add_ecosystem_tag';--> statement-breakpoint
CREATE TABLE "ecosystem_tags" (
	"id" uuid PRIMARY KEY NOT NULL,
	"ecosystem_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "ecosystem_tags_ecosystemId_tagId_unique" UNIQUE("ecosystem_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "ecosystem_tags" ADD CONSTRAINT "ecosystem_tags_ecosystem_id_ecosystems_id_fk" FOREIGN KEY ("ecosystem_id") REFERENCES "public"."ecosystems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecosystem_tags" ADD CONSTRAINT "ecosystem_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ecosystem_tags_ecosystem_id" ON "ecosystem_tags" USING btree ("ecosystem_id");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_tags_tag_id" ON "ecosystem_tags" USING btree ("tag_id");