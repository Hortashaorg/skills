/**
 * Common types for registry clients.
 * All registries return data in this format, ready for database insertion.
 */

// Import the canonical DependencyType from database schema
export type { DependencyType } from "@package/database/server";

// Re-import for local use
import type { DependencyType } from "@package/database/server";

export interface DependencyData {
	name: string;
	versionRange: string;
	type: DependencyType;
}

export interface VersionData {
	version: string;
	publishedAt: Date;
	isPrerelease: boolean;
	isYanked: boolean;
	dependencies: DependencyData[];
}

export interface PackageData {
	name: string;
	description?: string;
	homepage?: string;
	repository?: string;
	latestVersion?: string; // The "latest" stable version from dist-tags
	distTags?: Record<string, string>; // All dist-tags: {"latest": "1.0.0", "next": "2.0.0-beta"}
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
