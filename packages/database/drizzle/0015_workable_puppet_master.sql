CREATE TYPE "public"."package_status" AS ENUM('active', 'failed', 'placeholder');--> statement-breakpoint
CREATE TABLE "channel_dependencies" (
	"id" uuid PRIMARY KEY NOT NULL,
	"channel_id" uuid NOT NULL,
	"dependency_package_id" uuid NOT NULL,
	"dependency_version_range" text NOT NULL,
	"dependency_type" "dependency_type" NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "channel_dependencies_channelId_dependencyPackageId_dependencyType_unique" UNIQUE("channel_id","dependency_package_id","dependency_type")
);
--> statement-breakpoint
CREATE TABLE "package_release_channels" (
	"id" uuid PRIMARY KEY NOT NULL,
	"package_id" uuid NOT NULL,
	"channel" text NOT NULL,
	"version" text NOT NULL,
	"published_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "package_release_channels_packageId_channel_unique" UNIQUE("package_id","channel")
);
--> statement-breakpoint
ALTER TABLE "package_dependencies" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "package_versions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "package_dependencies" CASCADE;--> statement-breakpoint
DROP TABLE "package_versions" CASCADE;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "status" "package_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "failure_reason" text;--> statement-breakpoint
ALTER TABLE "channel_dependencies" ADD CONSTRAINT "channel_dependencies_channel_id_package_release_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."package_release_channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_dependencies" ADD CONSTRAINT "channel_dependencies_dependency_package_id_packages_id_fk" FOREIGN KEY ("dependency_package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_release_channels" ADD CONSTRAINT "package_release_channels_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_channel_dependencies_channel_id" ON "channel_dependencies" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "idx_channel_dependencies_dep_package_id" ON "channel_dependencies" USING btree ("dependency_package_id");--> statement-breakpoint
CREATE INDEX "idx_release_channels_package_id" ON "package_release_channels" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "idx_packages_status" ON "packages" USING btree ("status");