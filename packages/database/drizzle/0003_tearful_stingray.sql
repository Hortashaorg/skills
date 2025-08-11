CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag_to_technology" (
	"tech_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "tag_to_technology_tech_id_tag_id_pk" PRIMARY KEY("tech_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "technology" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"github" varchar(255),
	"website" varchar(255),
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "message" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "message" CASCADE;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tag_to_technology" ADD CONSTRAINT "tag_to_technology_tech_id_technology_id_fk" FOREIGN KEY ("tech_id") REFERENCES "public"."technology"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_to_technology" ADD CONSTRAINT "tag_to_technology_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE no action ON UPDATE no action;