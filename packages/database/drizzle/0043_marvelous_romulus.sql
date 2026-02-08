CREATE TABLE "project_upvotes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "project_upvotes_projectId_accountId_unique" UNIQUE("project_id","account_id")
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "upvote_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_upvotes" ADD CONSTRAINT "project_upvotes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_upvotes" ADD CONSTRAINT "project_upvotes_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_project_upvotes_project_id" ON "project_upvotes" USING btree ("project_id");