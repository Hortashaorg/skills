ALTER TABLE "threads" ADD COLUMN "project_package_id" uuid;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "project_ecosystem_id" uuid;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_project_package_id_project_packages_id_fk" FOREIGN KEY ("project_package_id") REFERENCES "public"."project_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_project_ecosystem_id_project_ecosystems_id_fk" FOREIGN KEY ("project_ecosystem_id") REFERENCES "public"."project_ecosystems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_threads_project_package_id" ON "threads" USING btree ("project_package_id");--> statement-breakpoint
CREATE INDEX "idx_threads_project_ecosystem_id" ON "threads" USING btree ("project_ecosystem_id");