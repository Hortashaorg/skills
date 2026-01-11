import type { Registry } from "@package/database/server";
import type {
	DependencyData,
	PackageData,
	ReleaseChannelData,
} from "../types.ts";
import type { JsrFetchResult } from "./client.ts";
import type { JsrVersionResponse } from "./schema.ts";

/**
 * Transform JSR API response to common PackageData format.
 */
export function mapJsrPackage(result: JsrFetchResult): PackageData {
	const pkg = result.package;
	const fullName = `@${pkg.scope}/${pkg.name}`;

	return {
		name: fullName,
		description: pkg.description,
		homepage: `https://jsr.io/${fullName}`,
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
			dependencies: mapDependencies(result.latestVersion),
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
 * Parse JSR dependency specifier to extract registry and name.
 * Format: "jsr:@scope/name" or "npm:package-name"
 */
function parseDependencySpecifier(specifier: string): {
	registry: Registry;
	name: string;
} {
	if (specifier.startsWith("jsr:")) {
		return { registry: "jsr", name: specifier.slice(4) };
	}
	if (specifier.startsWith("npm:")) {
		return { registry: "npm", name: specifier.slice(4) };
	}
	// Default to jsr if no prefix (shouldn't happen in practice)
	return { registry: "jsr", name: specifier };
}

function mapDependencies(version: JsrVersionResponse): DependencyData[] {
	const deps: DependencyData[] = [];

	if (version.dependencies) {
		for (const [specifier, versionRange] of Object.entries(
			version.dependencies,
		)) {
			const { registry, name } = parseDependencySpecifier(specifier);
			deps.push({
				name,
				versionRange,
				type: "runtime",
				registry,
			});
		}
	}

	return deps;
}
