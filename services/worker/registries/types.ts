/**
 * Common types for registry clients.
 * All registries return data in this format, ready for database insertion.
 */

export type DependencyType = "runtime" | "dev" | "peer" | "optional";

export interface DependencyData {
	name: string;
	versionRange: string;
	type: DependencyType;
}

export interface VersionData {
	version: string;
	publishedAt: Date;
	dependencies: DependencyData[];
}

export interface PackageData {
	name: string;
	description?: string;
	homepage?: string;
	repository?: string;
	versions: VersionData[];
}

/**
 * Result of fetching packages from a registry.
 * Each package is either successfully fetched or has an error.
 */
export type FetchResult = Map<string, PackageData | Error>;

/**
 * Registry-specific error for schema validation failures.
 * Indicates the registry API may have changed.
 */
export interface SchemaError extends Error {
	packageName: string;
	registryName: string;
}
