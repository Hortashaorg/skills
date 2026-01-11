import type { z } from "@package/common";
import ky, { HTTPError } from "ky";
import type { ArchPackage } from "./schema.ts";
import { schemas } from "./schema.ts";

const ARCH_API = "https://archlinux.org/packages";

/**
 * Error thrown when Arch Linux API response doesn't match expected schema.
 */
export class ArchLinuxSchemaError extends Error {
	packageName: string;
	registryName = "archlinux";
	zodError: z.ZodError;

	constructor(packageName: string, zodError: z.ZodError) {
		super(
			`Arch Linux API response for "${packageName}" failed schema validation: ${zodError.message}`,
		);
		this.name = "ArchLinuxSchemaError";
		this.packageName = packageName;
		this.zodError = zodError;
	}
}

const client = ky.create({
	prefixUrl: ARCH_API,
	timeout: 30_000,
	retry: {
		limit: 2,
		methods: ["get"],
		statusCodes: [408, 429, 500, 502, 503, 504],
	},
});

/**
 * Search for package by exact name.
 * Returns the first result from official repos (core, extra, multilib).
 */
export async function fetchPackage(name: string): Promise<ArchPackage> {
	const raw: unknown = await client
		.get("search/json/", {
			searchParams: { name },
		})
		.json();

	const parseResult = schemas.searchResponse.safeParse(raw);
	if (!parseResult.success) {
		throw new ArchLinuxSchemaError(name, parseResult.error);
	}

	const results = parseResult.data.results;

	// Find exact match (search can return partial matches)
	const exactMatch = results.find((pkg) => pkg.pkgname === name);
	if (!exactMatch) {
		throw new Error(`Package "${name}" not found in Arch Linux repositories`);
	}

	return exactMatch;
}

export interface ArchLinuxFetchResult {
	package: ArchPackage;
}

/**
 * Fetch package and return result.
 */
export async function fetchPackageWithVersion(
	name: string,
): Promise<ArchLinuxFetchResult> {
	const pkg = await fetchPackage(name);
	return { package: pkg };
}

/**
 * Fetch multiple packages with concurrency control.
 */
export async function fetchPackages(
	names: string[],
	concurrency = 5,
): Promise<Map<string, ArchLinuxFetchResult | Error>> {
	const results = new Map<string, ArchLinuxFetchResult | Error>();

	const chunks = chunk(names, concurrency);

	for (const batch of chunks) {
		const promises = batch.map(async (name) => {
			try {
				const data = await fetchPackageWithVersion(name);
				results.set(name, data);
			} catch (error) {
				if (error instanceof HTTPError && error.response.status === 404) {
					results.set(
						name,
						new Error(`Package "${name}" not found on Arch Linux`),
					);
				} else if (error instanceof ArchLinuxSchemaError) {
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
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}
