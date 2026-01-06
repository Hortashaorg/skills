ALTER TABLE "account" ADD COLUMN "zitadel_id" varchar(30);--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_zitadelId_unique" UNIQUE("zitadel_id");