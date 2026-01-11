import type {
	DependencyData,
	PackageData,
	ReleaseChannelData,
} from "../types.ts";
import type { NuGetFetchResult } from "./client.ts";
import type { NuGetDependencyGroup } from "./schema.ts";

/**
 * Transform NuGet API response to common PackageData format.
 */
export function mapNuGetPackage(result: NuGetFetchResult): PackageData {
	return {
		name: result.packageId,
		description: result.description,
		homepage: result.projectUrl,
		repository: undefined, // NuGet doesn't provide repository URL in registration
		latestVersion: result.latestVersion,
		distTags: result.latestVersion
			? { latest: result.latestVersion }
			: undefined,
		releaseChannels: mapReleaseChannels(result),
	};
}

function mapReleaseChannels(result: NuGetFetchResult): ReleaseChannelData[] {
	const channels: ReleaseChannelData[] = [];

	// NuGet only has a "latest" channel for our purposes
	if (result.latestEntry && result.latestVersion) {
		channels.push({
			channel: "latest",
			version: result.latestVersion,
			publishedAt: parsePublishedAt(result.latestPublished),
			dependencies: mapDependencies(result.latestEntry.dependencyGroups),
		});
	}

	return channels;
}

function parsePublishedAt(timeString: string | undefined): Date {
	if (!timeString) {
		return new Date(0);
	}
	return new Date(timeString);
}

/**
 * Map NuGet dependency groups to flat dependency list.
 * Takes union of all dependencies across all target frameworks.
 */
function mapDependencies(
	dependencyGroups: NuGetDependencyGroup[] | undefined,
): DependencyData[] {
	if (!dependencyGroups) return [];

	// Use a Map to dedupe dependencies by name (take first occurrence)
	const depsMap = new Map<string, DependencyData>();

	for (const group of dependencyGroups) {
		if (!group.dependencies) continue;

		for (const dep of group.dependencies) {
			// Only add if not already present (first framework wins)
			if (!depsMap.has(dep.id.toLowerCase())) {
				depsMap.set(dep.id.toLowerCase(), {
					name: dep.id,
					versionRange: parseVersionRange(dep.range),
					type: "runtime",
					registry: "nuget",
				});
			}
		}
	}

	return Array.from(depsMap.values());
}

/**
 * Parse NuGet version range to a simpler format.
 * NuGet uses interval notation: [1.0.0, ) means >= 1.0.0
 * We simplify to just the minimum version for display.
 */
function parseVersionRange(range: string | undefined): string {
	if (!range) return "*";

	// Handle exact version: [1.0.0]
	const exactMatch = range.match(/^\[([^\],]+)\]$/);
	if (exactMatch) {
		return exactMatch[1] ?? range;
	}

	// Handle minimum version: [1.0.0, ) or (1.0.0, )
	const minMatch = range.match(/^[[(]([^,]+),\s*[\])]$/);
	if (minMatch) {
		const version = minMatch[1];
		const isInclusive = range.startsWith("[");
		return isInclusive ? `>=${version}` : `>${version}`;
	}

	// Handle range: [1.0.0, 2.0.0) etc
	const rangeMatch = range.match(/^[[(]([^,]+),\s*([^\])]+)[\])]$/);
	if (rangeMatch) {
		return `${rangeMatch[1]} - ${rangeMatch[2]}`;
	}

	return range;
}
