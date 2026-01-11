import type { FetchResult } from "../types.ts";
import { fetchPackages } from "./client.ts";
import { mapJsrPackage } from "./mapper.ts";

export { JsrSchemaError } from "./client.ts";

/**
 * Fetch packages from JSR registry.
 * Returns data in common format ready for database insertion.
 *
 * @param names - Package names to fetch (must be scoped: @scope/name)
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
			results.set(name, mapJsrPackage(result));
		}
	}

	return results;
}
