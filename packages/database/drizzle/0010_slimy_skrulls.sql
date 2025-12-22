CREATE TABLE "package_upvotes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"package_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "package_upvotes_packageId_accountId_unique" UNIQUE("package_id","account_id")
);
--> statement-breakpoint
ALTER TABLE "package_upvotes" ADD CONSTRAINT "package_upvotes_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_upvotes" ADD CONSTRAINT "package_upvotes_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_package_upvotes_package_id" ON "package_upvotes" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "idx_package_upvotes_account_id" ON "package_upvotes" USING btree ("account_id");