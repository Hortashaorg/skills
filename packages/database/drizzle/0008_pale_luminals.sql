ALTER TABLE "package_versions" ALTER COLUMN "is_prerelease" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "package_versions" ALTER COLUMN "is_yanked" DROP DEFAULT;