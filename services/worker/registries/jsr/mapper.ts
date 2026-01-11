import type { Registry } from "@package/database/server";
import type {
	DependencyData,
	PackageData,
	ReleaseChannelData,
} from "../types.ts";
import type { JsrFetchResult } from "./client.ts";
import type { JsrDependency } from "./schema.ts";

/**
 * Transform JSR API response to common PackageData format.
 */
export function mapJsrPackage(result: JsrFetchResult): PackageData {
	const pkg = result.package;
	const fullName = `@${pkg.scope}/${pkg.name}`;

	return {
		name: fullName,
		description: pkg.description,
		homepage: undefined, // JSR doesn't provide homepage, only githubRepository
		repository: pkg.githubRepository
			? `https://github.com/${pkg.githubRepository.owner}/${pkg.githubRepository.name}`
			: undefined,
		latestVersion: pkg.latestVersion ?? undefined,
		distTags: pkg.latestVersion ? { latest: pkg.latestVersion } : undefined,
		releaseChannels: mapReleaseChannels(result),
	};
}

function mapReleaseChannels(result: JsrFetchResult): ReleaseChannelData[] {
	const channels: ReleaseChannelData[] = [];

	// JSR only has a "latest" channel (no dist-tags like npm)
	if (result.latestVersion && result.package.latestVersion) {
		channels.push({
			channel: "latest",
			version: result.package.latestVersion,
			publishedAt: parsePublishedAt(result.latestVersion.createdAt),
			dependencies: mapDependencies(result.dependencies),
		});
	}

	return channels;
}

function parsePublishedAt(timeString: string | undefined): Date {
	if (!timeString) {
		return new Date(); // No timestamp - use fetch time as fallback
	}
	return new Date(timeString);
}

function mapDependencies(dependencies: JsrDependency[]): DependencyData[] {
	// Use Map to dedupe by registry:name - first occurrence wins
	const depsMap = new Map<string, DependencyData>();

	for (const dep of dependencies) {
		const key = `${dep.kind}:${dep.name}`;
		if (!depsMap.has(key)) {
			depsMap.set(key, {
				name: dep.name,
				versionRange: dep.constraint,
				type: "runtime" as const,
				registry: dep.kind as Registry,
			});
		}
	}

	return Array.from(depsMap.values());
}
