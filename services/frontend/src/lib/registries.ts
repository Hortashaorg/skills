/**
 * Supported package registries.
 * Add new registries here to extend support across the app.
 */
export const REGISTRIES = ["npm", "jsr", "brew", "apt"] as const;

export type Registry = (typeof REGISTRIES)[number];

export type RegistryFilter = Registry | "all";

/** Registry options with labels (includes "All") */
export const REGISTRY_FILTER_OPTIONS: {
	value: RegistryFilter;
	label: string;
}[] = [
	{ value: "all", label: "All Registries" },
	{ value: "npm", label: "npm" },
	{ value: "jsr", label: "jsr" },
	{ value: "brew", label: "brew" },
	{ value: "apt", label: "apt" },
];

/** Registry options without "All" - for selecting a specific registry */
export const REGISTRY_OPTIONS: { value: Registry; label: string }[] = [
	{ value: "npm", label: "npm" },
	{ value: "jsr", label: "jsr" },
	{ value: "brew", label: "brew" },
	{ value: "apt", label: "apt" },
];

/**
 * Get display label for a registry
 */
export function getRegistryLabel(registry: Registry): string {
	const option = REGISTRY_OPTIONS.find((r) => r.value === registry);
	return option?.label ?? registry;
}
