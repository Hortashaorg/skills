import type { Registry } from "@package/database/server";
import * as dockerhub from "./dockerhub/index.ts";
import * as jsr from "./jsr/index.ts";
import * as npm from "./npm/index.ts";
import * as nuget from "./nuget/index.ts";

export * as dockerhub from "./dockerhub/index.ts";
export * as jsr from "./jsr/index.ts";
export * as npm from "./npm/index.ts";
export * as nuget from "./nuget/index.ts";
export type { FetchResult } from "./types.ts";
export * from "./types.ts";

/**
 * Registry dispatcher - routes to the correct adapter based on registry.
 * Throws if registry adapter is not implemented.
 */
export async function getPackages(
	registry: Registry,
	names: string[],
	concurrency = 5,
): Promise<Map<string, import("./types.ts").PackageData | Error>> {
	switch (registry) {
		case "npm":
			return npm.getPackages(names, concurrency);
		case "jsr":
			return jsr.getPackages(names, concurrency);
		case "nuget":
			return nuget.getPackages(names, concurrency);
		case "dockerhub":
			return dockerhub.getPackages(names, concurrency);
		default: {
			const _exhaustive: never = registry;
			throw new Error(`Unknown registry: ${_exhaustive}`);
		}
	}
}
