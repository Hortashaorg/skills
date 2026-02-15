ALTER TABLE "project_ecosystems" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "project_ecosystems" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "project_ecosystems" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "project_packages" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "project_packages" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "project_packages" ALTER COLUMN "updated_at" DROP DEFAULT;