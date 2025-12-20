ALTER TABLE "package_versions" ADD COLUMN "is_prerelease" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "package_versions" ADD COLUMN "is_yanked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "latest_version" text;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "dist_tags" jsonb;--> statement-breakpoint
CREATE INDEX "idx_package_versions_stable" ON "package_versions" USING btree ("package_id","published_at") WHERE "package_versions"."is_prerelease" = false AND "package_versions"."is_yanked" = false;