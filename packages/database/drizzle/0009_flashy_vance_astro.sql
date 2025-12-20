ALTER TABLE "package_dependencies" DROP CONSTRAINT "package_dependencies_resolved_version_id_package_versions_id_fk";
--> statement-breakpoint
DROP INDEX "idx_package_dependencies_resolved_version_id";--> statement-breakpoint
ALTER TABLE "package_dependencies" DROP COLUMN "resolved_version";--> statement-breakpoint
ALTER TABLE "package_dependencies" DROP COLUMN "resolved_version_id";