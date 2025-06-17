ALTER TABLE "account" RENAME COLUMN "nickname" TO "name";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_nickname_unique";--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_name_unique" UNIQUE("name");