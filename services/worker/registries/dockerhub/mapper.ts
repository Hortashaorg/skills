import type { PackageData, ReleaseChannelData } from "../types.ts";
import type { DockerHubFetchResult } from "./client.ts";

/**
 * Transform Docker Hub API response to common PackageData format.
 * Docker images don't have dependencies, so channels have empty dependency arrays.
 */
export function mapDockerHubImage(result: DockerHubFetchResult): PackageData {
	const { repository, namedTags } = result;

	const latestTag = namedTags.find((t) => t.name === "latest");

	return {
		name: formatImageName(repository.namespace, repository.name),
		description: repository.description ?? undefined,
		homepage: `https://hub.docker.com/${repository.namespace === "library" ? "_" : "r"}/${repository.namespace}/${repository.name}`,
		repository: undefined,
		latestVersion: latestTag ? "latest" : namedTags[0]?.name,
		distTags: buildDistTags(namedTags),
		releaseChannels: mapReleaseChannels(namedTags),
	};
}

/**
 * Format image name for display.
 * - library/node → node
 * - bitnami/postgresql → bitnami/postgresql
 */
function formatImageName(namespace: string, name: string): string {
	if (namespace === "library") {
		return name;
	}
	return `${namespace}/${name}`;
}

/**
 * Build dist-tags from named tags.
 * Each named tag points to itself (no separate version).
 */
function buildDistTags(
	tags: { name: string }[],
): Record<string, string> | undefined {
	if (tags.length === 0) return undefined;

	const distTags: Record<string, string> = {};
	for (const tag of tags) {
		distTags[tag.name] = tag.name;
	}
	return distTags;
}

/**
 * Map named tags to release channels.
 * Docker tags don't have versions or dependencies.
 */
function mapReleaseChannels(
	tags: { name: string; last_updated: string | null }[],
): ReleaseChannelData[] {
	return tags.map((tag) => ({
		channel: tag.name,
		version: tag.name,
		publishedAt: parsePublishedAt(tag.last_updated),
		dependencies: [],
	}));
}

function parsePublishedAt(timeString: string | null): Date {
	if (!timeString) {
		return new Date(0);
	}
	return new Date(timeString);
}
