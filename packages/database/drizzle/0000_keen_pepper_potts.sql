CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(100) NOT NULL,
	"nickname" varchar(50),
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL,
	CONSTRAINT "account_email_unique" UNIQUE("email"),
	CONSTRAINT "account_nickname_unique" UNIQUE("nickname")
);
