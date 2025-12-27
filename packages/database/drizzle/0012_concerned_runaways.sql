ALTER TABLE "package_requests" ALTER COLUMN "registry" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "registry" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."registry";--> statement-breakpoint
CREATE TYPE "public"."registry" AS ENUM('npm');--> statement-breakpoint
ALTER TABLE "package_requests" ALTER COLUMN "registry" SET DATA TYPE "public"."registry" USING "registry"::"public"."registry";--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "registry" SET DATA TYPE "public"."registry" USING "registry"::"public"."registry";