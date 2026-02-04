/**
 * Re-export entity types from hooks for markdown display.
 */

export type { Ecosystem } from "@/hooks/ecosystems/useEcosystemByIds";
// Re-export types from byIds hooks (these are what the Maps contain)
export type { Package } from "@/hooks/packages/usePackageByIds";
export type { Project } from "@/hooks/projects/useProjectByIds";
export type { User } from "@/hooks/users/useUserByIds";

export type EntityType = "user" | "project" | "package" | "ecosystem";

export function getEntityIcon(type: EntityType): string {
	switch (type) {
		case "user":
			return "👤";
		case "project":
			return "📁";
		case "package":
			return "📦";
		case "ecosystem":
			return "🌐";
	}
}

export function getEntityLabel(type: EntityType): string {
	switch (type) {
		case "user":
			return "User";
		case "project":
			return "Project";
		case "package":
			return "Package";
		case "ecosystem":
			return "Ecosystem";
	}
}
