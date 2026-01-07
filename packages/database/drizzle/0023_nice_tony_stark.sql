ALTER TABLE "account" DROP CONSTRAINT "account_email_unique";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "zitadel_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "email";