import type {
	DependencyData,
	PackageData,
	ReleaseChannelData,
} from "../types.ts";
import type { HomebrewFetchResult } from "./client.ts";
import type { HomebrewFormula } from "./schema.ts";

/**
 * Transform Homebrew API response to common PackageData format.
 */
export function mapHomebrewPackage(result: HomebrewFetchResult): PackageData {
	const { formula } = result;

	return {
		name: formula.name,
		description: formula.desc ?? undefined,
		homepage: formula.homepage ?? undefined,
		repository: undefined,
		latestVersion: formula.versions.stable ?? undefined,
		distTags: formula.versions.stable
			? { latest: formula.versions.stable }
			: undefined,
		releaseChannels: mapReleaseChannels(formula),
	};
}

function mapReleaseChannels(formula: HomebrewFormula): ReleaseChannelData[] {
	const channels: ReleaseChannelData[] = [];

	if (formula.versions.stable) {
		channels.push({
			channel: "latest",
			version: formula.versions.stable,
			publishedAt: new Date(), // Homebrew API doesn't provide publish date - use fetch time
			dependencies: mapDependencies(formula),
		});
	}

	return channels;
}

function mapDependencies(formula: HomebrewFormula): DependencyData[] {
	// Use Map to dedupe by name - first occurrence wins (runtime > dev > optional)
	const depsMap = new Map<string, DependencyData>();

	// Runtime dependencies (highest priority)
	for (const dep of formula.dependencies ?? []) {
		if (!depsMap.has(dep)) {
			depsMap.set(dep, {
				name: dep,
				versionRange: "*",
				type: "runtime",
				registry: "homebrew",
			});
		}
	}

	// Build dependencies
	for (const dep of formula.build_dependencies ?? []) {
		if (!depsMap.has(dep)) {
			depsMap.set(dep, {
				name: dep,
				versionRange: "*",
				type: "dev",
				registry: "homebrew",
			});
		}
	}

	// Optional dependencies (lowest priority)
	for (const dep of formula.optional_dependencies ?? []) {
		if (!depsMap.has(dep)) {
			depsMap.set(dep, {
				name: dep,
				versionRange: "*",
				type: "optional",
				registry: "homebrew",
			});
		}
	}

	return Array.from(depsMap.values());
}
