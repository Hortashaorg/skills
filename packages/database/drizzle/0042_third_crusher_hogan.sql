CREATE TABLE "project_statuses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"status" "project_status" NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "project_statuses_projectId_status_unique" UNIQUE("project_id","status")
);
--> statement-breakpoint
ALTER TABLE "project_statuses" ADD CONSTRAINT "project_statuses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_project_statuses_project_id" ON "project_statuses" USING btree ("project_id");