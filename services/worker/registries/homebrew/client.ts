import type { z } from "@package/common";
import ky, { HTTPError } from "ky";
import type { HomebrewFormula } from "./schema.ts";
import { schemas } from "./schema.ts";

const HOMEBREW_API = "https://formulae.brew.sh/api";

/**
 * Error thrown when Homebrew API response doesn't match expected schema.
 */
export class HomebrewSchemaError extends Error {
	packageName: string;
	registryName = "homebrew";
	zodError: z.ZodError;

	constructor(packageName: string, zodError: z.ZodError) {
		super(
			`Homebrew API response for "${packageName}" failed schema validation: ${zodError.message}`,
		);
		this.name = "HomebrewSchemaError";
		this.packageName = packageName;
		this.zodError = zodError;
	}
}

const client = ky.create({
	prefixUrl: HOMEBREW_API,
	timeout: 30_000,
	retry: {
		limit: 2,
		methods: ["get"],
		statusCodes: [408, 429, 500, 502, 503, 504],
	},
});

/**
 * Fetch formula from Homebrew.
 */
export async function fetchFormula(name: string): Promise<HomebrewFormula> {
	const raw: unknown = await client.get(`formula/${name}.json`).json();

	const parseResult = schemas.formula.safeParse(raw);
	if (!parseResult.success) {
		throw new HomebrewSchemaError(name, parseResult.error);
	}

	return parseResult.data;
}

export interface HomebrewFetchResult {
	formula: HomebrewFormula;
}

/**
 * Fetch formula and return result.
 */
export async function fetchPackageWithVersion(
	name: string,
): Promise<HomebrewFetchResult> {
	const formula = await fetchFormula(name);
	return { formula };
}

/**
 * Fetch multiple formulas with concurrency control.
 */
export async function fetchPackages(
	names: string[],
	concurrency = 5,
): Promise<Map<string, HomebrewFetchResult | Error>> {
	const results = new Map<string, HomebrewFetchResult | Error>();

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
						new Error(`Formula "${name}" not found on Homebrew`),
					);
				} else if (error instanceof HomebrewSchemaError) {
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
