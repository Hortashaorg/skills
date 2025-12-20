import type { FetchResult } from "../types.ts";
import { fetchPackages } from "./client.ts";
import { mapNpmPackage } from "./mapper.ts";

export { NpmSchemaError } from "./client.ts";

/**
 * Fetch packages from npm registry.
 * Returns data in common format ready for database insertion.
 *
 * @param names - Package names to fetch
 * @param concurrency - Max parallel requests (default 5)
 */
export async function getPackages(
	names: string[],
	concurrency = 5,
): Promise<FetchResult> {
	const rawResults = await fetchPackages(names, concurrency);
	const results: FetchResult = new Map();

	for (const [name, result] of rawResults) {
		if (result instanceof Error) {
			results.set(name, result);
		} else {
			results.set(name, mapNpmPackage(result));
		}
	}

	return results;
}
