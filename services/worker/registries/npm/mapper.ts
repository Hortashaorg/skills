import type { DependencyData, PackageData, VersionData } from "../types.ts";
import type { NpmPackageResponse, NpmVersionResponse } from "./schema.ts";

// Pre-release identifiers in version strings
const PRERELEASE_PATTERNS = [
	"-alpha",
	"-beta",
	"-rc",
	"-canary",
	"-experimental",
	"-next",
	"-nightly",
	"-dev",
	"-snapshot",
	"-preview",
	"-insiders",
];

/** Check if a version string is a pre-release */
function isPrerelease(version: string): boolean {
	const lower = version.toLowerCase();
	return PRERELEASE_PATTERNS.some((pattern) => lower.includes(pattern));
}

/**
 * Transform npm API response to common PackageData format.
 */
export function mapNpmPackage(response: NpmPackageResponse): PackageData {
	const distTags = response["dist-tags"];

	return {
		name: response.name,
		description: response.description,
		homepage: typeof response.homepage === "string" ? response.homepage : undefined,
		repository: extractRepository(response.repository),
		latestVersion: distTags.latest,
		distTags: distTags as Record<string, string>,
		versions: mapVersions(response),
	};
}

function extractRepository(repo: unknown): string | undefined {
	if (!repo) return undefined;

	if (typeof repo === "string") {
		return repo;
	}

	if (typeof repo === "object" && repo !== null && "url" in repo) {
		const url = (repo as { url: unknown }).url;
		if (typeof url === "string") {
			// Clean up git URLs: git+https://... → https://...
			return url.replace(/^git\+/, "").replace(/\.git$/, "");
		}
	}

	return undefined;
}

function mapVersions(response: NpmPackageResponse): VersionData[] {
	return Object.entries(response.versions).map(([version, info]) => ({
		version,
		publishedAt: parsePublishedAt(response.time[version]),
		isPrerelease: isPrerelease(version),
		isYanked: false, // npm doesn't have yanked versions in the same way
		dependencies: mapDependencies(info),
	}));
}

function parsePublishedAt(timeString: string | undefined): Date {
	if (!timeString) {
		return new Date(0); // Fallback for missing timestamps
	}
	return new Date(timeString);
}

function mapDependencies(version: NpmVersionResponse): DependencyData[] {
	const deps: DependencyData[] = [];

	// Skip if deps is a string (malformed package data)
	if (version.dependencies && typeof version.dependencies === "object") {
		for (const [name, range] of Object.entries(version.dependencies)) {
			deps.push({ name, versionRange: range, type: "runtime" });
		}
	}

	if (version.devDependencies && typeof version.devDependencies === "object") {
		for (const [name, range] of Object.entries(version.devDependencies)) {
			deps.push({ name, versionRange: range, type: "dev" });
		}
	}

	if (version.peerDependencies && typeof version.peerDependencies === "object") {
		for (const [name, range] of Object.entries(version.peerDependencies)) {
			deps.push({ name, versionRange: range, type: "peer" });
		}
	}

	if (version.optionalDependencies && typeof version.optionalDependencies === "object") {
		for (const [name, range] of Object.entries(version.optionalDependencies)) {
			deps.push({ name, versionRange: range, type: "optional" });
		}
	}

	return deps;
}
