import type { DependencyData, PackageData, VersionData } from "../types.ts";
import type { NpmPackageResponse, NpmVersionResponse } from "./schema.ts";

/**
 * Transform npm API response to common PackageData format.
 */
export function mapNpmPackage(response: NpmPackageResponse): PackageData {
	return {
		name: response.name,
		description: response.description,
		homepage: response.homepage,
		repository: extractRepository(response.repository),
		versions: mapVersions(response),
	};
}

function extractRepository(
	repo: NpmPackageResponse["repository"],
): string | undefined {
	if (!repo) return undefined;

	if (typeof repo === "string") {
		return repo;
	}

	// Clean up git URLs: git+https://... → https://...
	return repo.url.replace(/^git\+/, "").replace(/\.git$/, "");
}

function mapVersions(response: NpmPackageResponse): VersionData[] {
	return Object.entries(response.versions).map(([version, info]) => ({
		version,
		publishedAt: parsePublishedAt(response.time[version]),
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

	if (version.dependencies) {
		for (const [name, range] of Object.entries(version.dependencies)) {
			deps.push({ name, versionRange: range, type: "runtime" });
		}
	}

	if (version.devDependencies) {
		for (const [name, range] of Object.entries(version.devDependencies)) {
			deps.push({ name, versionRange: range, type: "dev" });
		}
	}

	if (version.peerDependencies) {
		for (const [name, range] of Object.entries(version.peerDependencies)) {
			deps.push({ name, versionRange: range, type: "peer" });
		}
	}

	if (version.optionalDependencies) {
		for (const [name, range] of Object.entries(version.optionalDependencies)) {
			deps.push({ name, versionRange: range, type: "optional" });
		}
	}

	return deps;
}
