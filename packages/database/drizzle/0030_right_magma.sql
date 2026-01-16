CREATE TABLE "ecosystem_packages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"ecosystem_id" uuid NOT NULL,
	"package_id" uuid NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "ecosystem_packages_ecosystemId_packageId_unique" UNIQUE("ecosystem_id","package_id")
);
--> statement-breakpoint
CREATE TABLE "ecosystem_upvotes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"ecosystem_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "ecosystem_upvotes_ecosystemId_accountId_unique" UNIQUE("ecosystem_id","account_id")
);
--> statement-breakpoint
CREATE TABLE "ecosystems" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"website" text,
	"upvote_count" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "ecosystems_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "project_ecosystems" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"ecosystem_id" uuid NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "project_ecosystems_projectId_ecosystemId_unique" UNIQUE("project_id","ecosystem_id")
);
--> statement-breakpoint
ALTER TABLE "ecosystem_packages" ADD CONSTRAINT "ecosystem_packages_ecosystem_id_ecosystems_id_fk" FOREIGN KEY ("ecosystem_id") REFERENCES "public"."ecosystems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecosystem_packages" ADD CONSTRAINT "ecosystem_packages_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecosystem_upvotes" ADD CONSTRAINT "ecosystem_upvotes_ecosystem_id_ecosystems_id_fk" FOREIGN KEY ("ecosystem_id") REFERENCES "public"."ecosystems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecosystem_upvotes" ADD CONSTRAINT "ecosystem_upvotes_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_ecosystems" ADD CONSTRAINT "project_ecosystems_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_ecosystems" ADD CONSTRAINT "project_ecosystems_ecosystem_id_ecosystems_id_fk" FOREIGN KEY ("ecosystem_id") REFERENCES "public"."ecosystems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ecosystem_packages_ecosystem_id" ON "ecosystem_packages" USING btree ("ecosystem_id");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_packages_package_id" ON "ecosystem_packages" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_upvotes_account_id" ON "ecosystem_upvotes" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_ecosystems_upvote_count" ON "ecosystems" USING btree ("upvote_count");--> statement-breakpoint
CREATE INDEX "idx_project_ecosystems_project_id" ON "project_ecosystems" USING btree ("project_id");