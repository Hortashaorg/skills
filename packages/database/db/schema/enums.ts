import { pgEnum } from "drizzle-orm/pg-core";

export const registryEnum = pgEnum("registry", ["npm", "jsr"]);

export const dependencyTypeEnum = pgEnum("dependency_type", [
	"runtime",
	"dev",
	"peer",
	"optional",
]);

export const fetchStatusEnum = pgEnum("fetch_status", [
	"pending",
	"completed",
	"failed",
]);

export const packageStatusEnum = pgEnum("package_status", [
	"active",
	"failed",
	"placeholder",
]);

export const suggestionTypeEnum = pgEnum("suggestion_type", ["add_tag"]);

export const suggestionStatusEnum = pgEnum("suggestion_status", [
	"pending",
	"approved",
	"rejected",
]);

export const voteEnum = pgEnum("vote", ["approve", "reject"]);

export const contributionEventTypeEnum = pgEnum("contribution_event_type", [
	"suggestion_approved",
	"suggestion_rejected",
	"vote_matched",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
	"suggestion_approved",
	"suggestion_rejected",
]);
