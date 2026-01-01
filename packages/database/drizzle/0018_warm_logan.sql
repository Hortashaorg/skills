CREATE TYPE "public"."fetch_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "package_fetches" (
	"id" uuid PRIMARY KEY NOT NULL,
	"package_id" uuid NOT NULL,
	"status" "fetch_status" NOT NULL,
	"error_message" text,
	"created_at" timestamp NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
DROP TABLE "package_requests" CASCADE;--> statement-breakpoint
ALTER TABLE "package_fetches" ADD CONSTRAINT "package_fetches_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_package_fetches_package_id" ON "package_fetches" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "idx_package_fetches_pending" ON "package_fetches" USING btree ("status","created_at") WHERE "package_fetches"."status" = 'pending';--> statement-breakpoint
DROP TYPE "public"."package_request_status";