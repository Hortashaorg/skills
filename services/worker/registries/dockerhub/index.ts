import type { FetchResult } from "../types.ts";
import { fetchImages } from "./client.ts";
import { mapDockerHubImage } from "./mapper.ts";

export { DockerHubSchemaError } from "./client.ts";

export async function getPackages(
	names: string[],
	concurrency = 5,
): Promise<FetchResult> {
	const rawResults = await fetchImages(names, concurrency);
	const results: FetchResult = new Map();

	for (const [name, result] of rawResults) {
		if (result instanceof Error) {
			results.set(name, result);
		} else {
			results.set(name, mapDockerHubImage(result));
		}
	}

	return results;
}
