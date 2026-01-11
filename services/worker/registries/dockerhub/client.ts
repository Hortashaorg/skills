import type { z } from "@package/common";
import ky, { HTTPError } from "ky";
import type { DockerHubRepository, DockerHubTag } from "./schema.ts";
import { schemas } from "./schema.ts";

const DOCKERHUB_API = "https://hub.docker.com/v2";

/**
 * Error thrown when Docker Hub API response doesn't match expected schema.
 */
export class DockerHubSchemaError extends Error {
	packageName: string;
	registryName = "dockerhub";
	zodError: z.ZodError;

	constructor(packageName: string, zodError: z.ZodError) {
		super(
			`Docker Hub API response for "${packageName}" failed schema validation: ${zodError.message}`,
		);
		this.name = "DockerHubSchemaError";
		this.packageName = packageName;
		this.zodError = zodError;
	}
}

const client = ky.create({
	prefixUrl: DOCKERHUB_API,
	timeout: 30_000,
	retry: {
		limit: 2,
		methods: ["get"],
		statusCodes: [408, 429, 500, 502, 503, 504],
	},
});

/**
 * Parse Docker image name into namespace and repository.
 * - "node" → { namespace: "library", name: "node" }
 * - "nginx" → { namespace: "library", name: "nginx" }
 * - "bitnami/postgresql" → { namespace: "bitnami", name: "postgresql" }
 */
function parseImageName(imageName: string): {
	namespace: string;
	name: string;
} {
	if (imageName.includes("/")) {
		const [namespace, name] = imageName.split("/", 2);
		return { namespace: namespace ?? imageName, name: name ?? imageName };
	}
	return { namespace: "library", name: imageName };
}

/**
 * Check if a tag is a "named" tag (no digits = not a version).
 * Examples:
 * - "latest" → true
 * - "alpine" → true
 * - "slim" → true
 * - "1.25" → false
 * - "20-alpine" → false
 */
function isNamedTag(tag: string): boolean {
	return !/\d/.test(tag);
}

/**
 * Fetch repository metadata from Docker Hub.
 */
export async function fetchRepository(
	imageName: string,
): Promise<DockerHubRepository> {
	const { namespace, name } = parseImageName(imageName);
	const raw: unknown = await client
		.get(`repositories/${namespace}/${name}/`)
		.json();

	const parseResult = schemas.repository.safeParse(raw);
	if (!parseResult.success) {
		throw new DockerHubSchemaError(imageName, parseResult.error);
	}

	return parseResult.data;
}

/**
 * Fetch all named tags (non-version tags) from Docker Hub.
 * Only fetches first page since named tags are typically few.
 */
export async function fetchNamedTags(
	imageName: string,
): Promise<DockerHubTag[]> {
	const { namespace, name } = parseImageName(imageName);
	const raw: unknown = await client
		.get(`repositories/${namespace}/${name}/tags`, {
			searchParams: { page_size: 100 },
		})
		.json();

	const parseResult = schemas.tagsResponse.safeParse(raw);
	if (!parseResult.success) {
		throw new DockerHubSchemaError(imageName, parseResult.error);
	}

	return parseResult.data.results.filter((tag) => isNamedTag(tag.name));
}

export interface DockerHubFetchResult {
	repository: DockerHubRepository;
	namedTags: DockerHubTag[];
}

/**
 * Fetch repository and named tags in parallel.
 */
export async function fetchImageWithTags(
	imageName: string,
): Promise<DockerHubFetchResult> {
	const [repository, namedTags] = await Promise.all([
		fetchRepository(imageName),
		fetchNamedTags(imageName),
	]);

	return { repository, namedTags };
}

/**
 * Fetch multiple images with concurrency control.
 */
export async function fetchImages(
	names: string[],
	concurrency = 5,
): Promise<Map<string, DockerHubFetchResult | Error>> {
	const results = new Map<string, DockerHubFetchResult | Error>();

	const chunks = chunk(names, concurrency);

	for (const batch of chunks) {
		const promises = batch.map(async (name) => {
			try {
				const data = await fetchImageWithTags(name);
				results.set(name, data);
			} catch (error) {
				if (error instanceof HTTPError && error.response.status === 404) {
					results.set(
						name,
						new Error(`Image "${name}" not found on Docker Hub`),
					);
				} else if (error instanceof DockerHubSchemaError) {
					results.set(name, error);
				} else {
					results.set(
						name,
						error instanceof Error ? error : new Error(String(error)),
					);
				}
			}
		});

		await Promise.all(promises);
	}

	return results;
}

function chunk<T>(array: T[], size: number): T[][] {
	// Guard against infinite loop if size <= 0
	const safeSize = Math.max(1, size);
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += safeSize) {
		chunks.push(array.slice(i, i + safeSize));
	}
	return chunks;
}
