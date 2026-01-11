import type {
	DependencyData,
	PackageData,
	ReleaseChannelData,
} from "../types.ts";
import type { NpmPackageResponse, NpmVersionResponse } from "./schema.ts";

/**
 * Transform npm API response to common PackageData format.
 * Only extracts release channels from dist-tags (not all versions).
 */
export function mapNpmPackage(response: NpmPackageResponse): PackageData {
	const distTags = response["dist-tags"];

	return {
		name: response.name,
		description: response.description,
		homepage:
			typeof response.homepage === "string" ? response.homepage : undefined,
		repository: extractRepository(response.repository),
		latestVersion: distTags.latest,
		distTags: distTags as Record<string, string>,
		releaseChannels: mapReleaseChannels(response),
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

/**
 * Map dist-tags to release channels.
 * Each dist-tag (latest, next, beta, etc.) becomes a release channel.
 */
function mapReleaseChannels(
	response: NpmPackageResponse,
): ReleaseChannelData[] {
	const distTags = response["dist-tags"];
	const channels: ReleaseChannelData[] = [];

	for (const [channel, version] of Object.entries(distTags)) {
		if (typeof version !== "string") continue;
		const versionInfo = response.versions[version];
		if (!versionInfo) continue;

		channels.push({
			channel,
			version,
			publishedAt: parsePublishedAt(response.time[version]),
			dependencies: mapDependencies(versionInfo),
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

function mapDependencies(version: NpmVersionResponse): DependencyData[] {
	const deps: DependencyData[] = [];

	if (version.dependencies && typeof version.dependencies === "object") {
		for (const [name, range] of Object.entries(version.dependencies)) {
			deps.push({
				name,
				versionRange: range,
				type: "runtime",
				registry: "npm",
			});
		}
	}

	if (version.devDependencies && typeof version.devDependencies === "object") {
		for (const [name, range] of Object.entries(version.devDependencies)) {
			deps.push({ name, versionRange: range, type: "dev", registry: "npm" });
		}
	}

	if (
		version.peerDependencies &&
		typeof version.peerDependencies === "object"
	) {
		for (const [name, range] of Object.entries(version.peerDependencies)) {
			deps.push({ name, versionRange: range, type: "peer", registry: "npm" });
		}
	}

	if (
		version.optionalDependencies &&
		typeof version.optionalDependencies === "object"
	) {
		for (const [name, range] of Object.entries(version.optionalDependencies)) {
			deps.push({
				name,
				versionRange: range,
				type: "optional",
				registry: "npm",
			});
		}
	}

	return deps;
}
