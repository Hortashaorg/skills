import type { z } from "@package/common";
import ky, { HTTPError } from "ky";
import type { NpmPackageResponse } from "./schema.ts";
import { schemas } from "./schema.ts";

const NPM_REGISTRY = "https://registry.npmjs.org";

/**
 * Error thrown when npm API response doesn't match expected schema.
 * Indicates npm may have changed their API structure.
 */
export class NpmSchemaError extends Error {
	packageName: string;
	registryName = "npm";
	zodError: z.ZodError;

	constructor(packageName: string, zodError: z.ZodError) {
		super(
			`npm API response for "${packageName}" failed schema validation: ${zodError.message}`,
		);
		this.name = "NpmSchemaError";
		this.packageName = packageName;
		this.zodError = zodError;
	}
}

/**
 * Error thrown when a package has been unpublished from npm.
 */
export class NpmUnpublishedError extends Error {
	packageName: string;

	constructor(packageName: string) {
		super(`Package "${packageName}" has been unpublished from npm`);
		this.name = "NpmUnpublishedError";
		this.packageName = packageName;
	}
}

const client = ky.create({
	prefixUrl: NPM_REGISTRY,
	timeout: 30_000,
	retry: {
		limit: 2,
		methods: ["get"],
		statusCodes: [408, 429, 500, 502, 503, 504],
	},
});

/**
 * Fetch a single package from npm registry.
 * Validates response against schema.
 */
export async function fetchPackage(name: string): Promise<NpmPackageResponse> {
	const raw: unknown = await client.get(encodeURIComponent(name)).json();

	// Check for unpublished packages (they have time.unpublished as an object)
	if (
		raw &&
		typeof raw === "object" &&
		"time" in raw &&
		raw.time &&
		typeof raw.time === "object" &&
		"unpublished" in raw.time &&
		typeof raw.time.unpublished === "object"
	) {
		throw new NpmUnpublishedError(name);
	}

	const parseResult = schemas.package.safeParse(raw);
	if (!parseResult.success) {
		throw new NpmSchemaError(name, parseResult.error);
	}

	return parseResult.data;
}

/**
 * Fetch multiple packages with concurrency control.
 * Returns raw npm responses or errors.
 */
export async function fetchPackages(
	names: string[],
	concurrency = 5,
): Promise<Map<string, NpmPackageResponse | Error>> {
	const results = new Map<string, NpmPackageResponse | Error>();

	const chunks = chunk(names, concurrency);

	for (const batch of chunks) {
		const promises = batch.map(async (name) => {
			try {
				const data = await fetchPackage(name);
				results.set(name, data);
			} catch (error) {
				if (error instanceof HTTPError && error.response.status === 404) {
					results.set(name, new Error(`Package "${name}" not found`));
				} else if (error instanceof NpmSchemaError) {
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
