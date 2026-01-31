ALTER TABLE "threads" DROP CONSTRAINT "threads_account_id_account_id_fk";
--> statement-breakpoint
DROP INDEX "idx_threads_account_id";--> statement-breakpoint
ALTER TABLE "threads" DROP COLUMN "account_id";