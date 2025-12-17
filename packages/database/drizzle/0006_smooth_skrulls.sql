CREATE TYPE "public"."actor_type" AS ENUM('user', 'worker', 'system');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('create', 'insert', 'update', 'upsert', 'delete');--> statement-breakpoint
CREATE TYPE "public"."dependency_type" AS ENUM('runtime', 'dev', 'peer', 'optional');--> statement-breakpoint
CREATE TYPE "public"."package_request_status" AS ENUM('pending', 'fetching', 'completed', 'failed', 'discarded');--> statement-breakpoint
CREATE TYPE "public"."registry" AS ENUM('npm', 'jsr', 'brew', 'apt');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"action" "audit_action" NOT NULL,
	"actor_type" "actor_type" NOT NULL,
	"actor_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_dependencies" (
	"id" uuid PRIMARY KEY NOT NULL,
	"package_id" uuid NOT NULL,
	"version_id" uuid NOT NULL,
	"dependency_name" text NOT NULL,
	"dependency_package_id" uuid,
	"dependency_version_range" text NOT NULL,
	"resolved_version" text NOT NULL,
	"resolved_version_id" uuid,
	"dependency_type" "dependency_type" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_requests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"package_name" text NOT NULL,
	"registry" "registry" NOT NULL,
	"status" "package_request_status" NOT NULL,
	"error_message" text,
	"package_id" uuid,
	"attempt_count" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_tags" (
	"id" uuid PRIMARY KEY NOT NULL,
	"package_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "package_tags_packageId_tagId_unique" UNIQUE("package_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "package_versions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"package_id" uuid NOT NULL,
	"version" text NOT NULL,
	"published_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "package_versions_packageId_version_unique" UNIQUE("package_id","version")
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"registry" "registry" NOT NULL,
	"description" text,
	"homepage" text,
	"repository" text,
	"last_fetch_attempt" timestamp NOT NULL,
	"last_fetch_success" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "packages_name_registry_unique" UNIQUE("name","registry")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"color" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "tag" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tag_to_technology" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "technology" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "tag" CASCADE;--> statement-breakpoint
DROP TABLE "tag_to_technology" CASCADE;--> statement-breakpoint
DROP TABLE "technology" CASCADE;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_account_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_dependencies" ADD CONSTRAINT "package_dependencies_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_dependencies" ADD CONSTRAINT "package_dependencies_version_id_package_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."package_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_dependencies" ADD CONSTRAINT "package_dependencies_dependency_package_id_packages_id_fk" FOREIGN KEY ("dependency_package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_dependencies" ADD CONSTRAINT "package_dependencies_resolved_version_id_package_versions_id_fk" FOREIGN KEY ("resolved_version_id") REFERENCES "public"."package_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_requests" ADD CONSTRAINT "package_requests_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_tags" ADD CONSTRAINT "package_tags_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_tags" ADD CONSTRAINT "package_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_versions" ADD CONSTRAINT "package_versions_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_log_entity" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_action" ON "audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_log_actor" ON "audit_log" USING btree ("actor_type","actor_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_created_at" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_package_dependencies_package_id" ON "package_dependencies" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "idx_package_dependencies_version_id" ON "package_dependencies" USING btree ("version_id");--> statement-breakpoint
CREATE INDEX "idx_package_dependencies_dependency_name" ON "package_dependencies" USING btree ("dependency_name");--> statement-breakpoint
CREATE INDEX "idx_package_dependencies_dependency_package_id" ON "package_dependencies" USING btree ("dependency_package_id");--> statement-breakpoint
CREATE INDEX "idx_package_dependencies_resolved_version_id" ON "package_dependencies" USING btree ("resolved_version_id");--> statement-breakpoint
CREATE INDEX "idx_package_dependencies_unlinked" ON "package_dependencies" USING btree ("dependency_name","created_at") WHERE "package_dependencies"."dependency_package_id" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_package_requests_unique_pending" ON "package_requests" USING btree ("package_name","registry","status") WHERE "package_requests"."status" IN ('pending', 'fetching');--> statement-breakpoint
CREATE INDEX "idx_package_requests_status_created" ON "package_requests" USING btree ("status","created_at") WHERE "package_requests"."status" IN ('pending', 'fetching');--> statement-breakpoint
CREATE INDEX "idx_package_tags_package_id" ON "package_tags" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "idx_package_tags_tag_id" ON "package_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "idx_package_versions_package_id" ON "package_versions" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "idx_package_versions_published_at" ON "package_versions" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_packages_name" ON "packages" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_packages_registry" ON "packages" USING btree ("registry");--> statement-breakpoint
CREATE INDEX "idx_packages_last_fetch_attempt" ON "packages" USING btree ("last_fetch_attempt");--> statement-breakpoint
CREATE INDEX "idx_packages_created_at" ON "packages" USING btree ("created_at");