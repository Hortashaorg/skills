CREATE TYPE "public"."contribution_event_type" AS ENUM('suggestion_approved', 'suggestion_rejected', 'vote_matched');--> statement-breakpoint
CREATE TYPE "public"."suggestion_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."suggestion_type" AS ENUM('add_tag');--> statement-breakpoint
CREATE TYPE "public"."vote" AS ENUM('approve', 'reject');--> statement-breakpoint
CREATE TABLE "contribution_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"account_id" uuid NOT NULL,
	"type" "contribution_event_type" NOT NULL,
	"points" integer NOT NULL,
	"suggestion_id" uuid,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contribution_scores" (
	"id" uuid PRIMARY KEY NOT NULL,
	"account_id" uuid NOT NULL,
	"monthly_score" integer NOT NULL,
	"all_time_score" integer NOT NULL,
	"last_calculated_at" timestamp NOT NULL,
	CONSTRAINT "contribution_scores_accountId_unique" UNIQUE("account_id")
);
--> statement-breakpoint
CREATE TABLE "suggestion_votes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"suggestion_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"vote" "vote" NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "suggestion_votes_suggestionId_accountId_unique" UNIQUE("suggestion_id","account_id")
);
--> statement-breakpoint
CREATE TABLE "suggestions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"package_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"type" "suggestion_type" NOT NULL,
	"version" integer NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "suggestion_status" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
DROP TABLE "audit_log" CASCADE;--> statement-breakpoint
ALTER TABLE "contribution_events" ADD CONSTRAINT "contribution_events_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribution_events" ADD CONSTRAINT "contribution_events_suggestion_id_suggestions_id_fk" FOREIGN KEY ("suggestion_id") REFERENCES "public"."suggestions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribution_scores" ADD CONSTRAINT "contribution_scores_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestion_votes" ADD CONSTRAINT "suggestion_votes_suggestion_id_suggestions_id_fk" FOREIGN KEY ("suggestion_id") REFERENCES "public"."suggestions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestion_votes" ADD CONSTRAINT "suggestion_votes_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_contribution_events_account_id" ON "contribution_events" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_contribution_events_created_at" ON "contribution_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_contribution_scores_monthly" ON "contribution_scores" USING btree ("monthly_score");--> statement-breakpoint
CREATE INDEX "idx_contribution_scores_all_time" ON "contribution_scores" USING btree ("all_time_score");--> statement-breakpoint
CREATE INDEX "idx_suggestion_votes_suggestion_id" ON "suggestion_votes" USING btree ("suggestion_id");--> statement-breakpoint
CREATE INDEX "idx_suggestions_package_id" ON "suggestions" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "idx_suggestions_status" ON "suggestions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_suggestions_account_id" ON "suggestions" USING btree ("account_id");--> statement-breakpoint
DROP TYPE "public"."actor_type";--> statement-breakpoint
DROP TYPE "public"."audit_action";