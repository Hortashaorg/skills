ALTER TABLE "packages" ADD COLUMN "upvote_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_packages_upvote_count" ON "packages" USING btree ("upvote_count");