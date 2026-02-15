CREATE TYPE "public"."project_member_role" AS ENUM('owner', 'contributor');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('aware', 'evaluating', 'trialing', 'approved', 'adopted', 'rejected', 'phasing_out', 'dropped');--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"role" "project_member_role" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "project_members_projectId_accountId_unique" UNIQUE("project_id","account_id")
);
--> statement-breakpoint
ALTER TABLE "project_ecosystems" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "project_packages" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "project_ecosystems" ADD COLUMN "status" "project_status" DEFAULT 'adopted' NOT NULL;--> statement-breakpoint
ALTER TABLE "project_ecosystems" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "project_packages" ADD COLUMN "status" "project_status" DEFAULT 'adopted' NOT NULL;--> statement-breakpoint
ALTER TABLE "project_packages" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_project_members_project_id" ON "project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_members_account_id" ON "project_members" USING btree ("account_id");