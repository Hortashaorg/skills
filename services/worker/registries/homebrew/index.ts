import type { FetchResult } from "../types.ts";
import { fetchPackages } from "./client.ts";
import { mapHomebrewPackage } from "./mapper.ts";

export { HomebrewSchemaError } from "./client.ts";

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
			results.set(name, mapHomebrewPackage(result));
		}
	}

	return results;
}
