import { pgEnum } from "drizzle-orm/pg-core";

export const registryEnum = pgEnum("registry", ["npm"]);

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

export const auditActionEnum = pgEnum("audit_action", [
	"create",
	"insert",
	"update",
	"upsert",
	"delete",
]);

export const actorTypeEnum = pgEnum("actor_type", ["user", "worker", "system"]);

export const packageStatusEnum = pgEnum("package_status", [
	"active",
	"failed",
	"placeholder",
]);
