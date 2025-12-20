/**
 * Registry types and options derived from database schema.
 * The source of truth is packages/database/db/schema.ts
 */
import { enums, type Registry } from "@package/database/client";

// Re-export the type for convenience
export type { Registry } from "@package/database/client";

export type RegistryFilter = Registry | "all";

/** Registry options with labels (includes "All") */
export const REGISTRY_FILTER_OPTIONS: {
	value: RegistryFilter;
	label: string;
}[] = [
	{ value: "all", label: "All Registries" },
	...enums.registry.map((r) => ({ value: r, label: r })),
];

/** Registry options without "All" - for selecting a specific registry */
export const REGISTRY_OPTIONS: { value: Registry; label: string }[] =
	enums.registry.map((r) => ({ value: r, label: r }));

/**
 * Get display label for a registry
 */
export function getRegistryLabel(registry: Registry): string {
	return registry;
}
