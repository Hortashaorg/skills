import { pgEnum } from "drizzle-orm/pg-core";

export const registryEnum = pgEnum("registry", [
	"npm",
	"jsr",
	"nuget",
	"dockerhub",
	"homebrew",
	"archlinux",
]);

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

export const suggestionTypeEnum = pgEnum("suggestion_type", [
	"add_tag",
	"remove_tag",
	"create_ecosystem",
	"add_ecosystem_package",
	"remove_ecosystem_package",
	"add_ecosystem_tag",
	"remove_ecosystem_tag",
	"edit_ecosystem_description",
	"edit_ecosystem_website",
]);

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

export const projectStatusEnum = pgEnum("project_status", [
	"aware",
	"evaluating",
	"trialing",
	"approved",
	"adopted",
	"rejected",
	"phasing_out",
	"dropped",
]);

export const projectMemberRoleEnum = pgEnum("project_member_role", [
	"owner",
	"contributor",
]);
