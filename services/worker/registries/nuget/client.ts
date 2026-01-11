import type { z } from "@package/common";
import ky, { HTTPError } from "ky";
import type {
	NuGetCatalogEntry,
	NuGetPage,
	NuGetRegistration,
} from "./schema.ts";
import { schemas } from "./schema.ts";

const NUGET_API = "https://api.nuget.org/v3";

/**
 * Error thrown when NuGet API response doesn't match expected schema.
 */
export class NuGetSchemaError extends Error {
	packageName: string;
	registryName = "nuget";
	zodError: z.ZodError;

	constructor(packageName: string, zodError: z.ZodError) {
		super(
			`NuGet API response for "${packageName}" failed schema validation: ${zodError.message}`,
		);
		this.name = "NuGetSchemaError";
		this.packageName = packageName;
		this.zodError = zodError;
	}
}

const client = ky.create({
	prefixUrl: NUGET_API,
	timeout: 30_000,
	retry: {
		limit: 2,
		methods: ["get"],
		statusCodes: [408, 429, 500, 502, 503, 504],
	},
});

/**
 * Fetch package registration from NuGet.
 * NuGet package IDs are case-insensitive, so we lowercase the name.
 */
export async function fetchRegistration(
	packageName: string,
): Promise<NuGetRegistration> {
	const lowercaseName = packageName.toLowerCase();
	const raw: unknown = await client
		.get(`registration5-semver1/${lowercaseName}/index.json`)
		.json();

	const parseResult = schemas.registration.safeParse(raw);
	if (!parseResult.success) {
		throw new NuGetSchemaError(packageName, parseResult.error);
	}

	return parseResult.data;
}

/**
 * Fetch a specific page if items aren't inlined in the registration response.
 * Uses configured client for consistent retry/timeout settings.
 */
async function fetchPage(
	pageUrl: string,
	packageName: string,
): Promise<NuGetPage> {
	// Use client with absolute URL (ky uses the URL directly when absolute)
	const raw: unknown = await client.get(pageUrl).json();
	const parseResult = schemas.page.safeParse(raw);
	if (!parseResult.success) {
		throw new NuGetSchemaError(packageName, parseResult.error);
	}
	return parseResult.data;
}

export interface NuGetFetchResult {
	packageId: string;
	description?: string;
	projectUrl?: string;
	latestVersion?: string;
	latestPublished?: string;
	latestEntry?: NuGetCatalogEntry;
}

/**
 * Fetch package and extract latest version info.
 * Handles paginated responses where items might need to be fetched separately.
 */
export async function fetchPackageWithVersion(
	packageName: string,
): Promise<NuGetFetchResult> {
	const registration = await fetchRegistration(packageName);

	// Find the latest stable version from all pages
	let latestEntry: NuGetCatalogEntry | undefined;
	let latestPublished: Date | undefined;

	for (const page of registration.items) {
		let items = page.items;

		// If items aren't inlined, fetch the page
		if (!items) {
			const fullPage = await fetchPage(page["@id"], packageName);
			items = fullPage.items;
		}

		if (!items) continue;

		for (const item of items) {
			const entry = item.catalogEntry;

			// Skip unlisted packages
			if (entry.listed === false) continue;

			// Skip prereleases for "latest" version
			if (isPrerelease(entry.version)) continue;

			const published = entry.published ? new Date(entry.published) : undefined;

			if (
				!latestEntry ||
				(published && latestPublished && published > latestPublished)
			) {
				latestEntry = entry;
				latestPublished = published;
			}
		}
	}

	// If no stable version, take any version
	if (!latestEntry && registration.items.length > 0) {
		const lastPage = registration.items[registration.items.length - 1];
		let items = lastPage?.items;
		if (!items && lastPage) {
			const fullPage = await fetchPage(lastPage["@id"], packageName);
			items = fullPage.items;
		}
		if (items && items.length > 0) {
			latestEntry = items[items.length - 1]?.catalogEntry;
			latestPublished = latestEntry?.published
				? new Date(latestEntry.published)
				: undefined;
		}
	}

	return {
		packageId: latestEntry?.id ?? packageName,
		description: latestEntry?.description,
		projectUrl: latestEntry?.projectUrl || undefined,
		latestVersion: latestEntry?.version,
		latestPublished: latestPublished?.toISOString(),
		latestEntry,
	};
}

function isPrerelease(version: string): boolean {
	return version.includes("-");
}

/**
 * Fetch multiple packages with concurrency control.
 */
export async function fetchPackages(
	names: string[],
	concurrency = 5,
): Promise<Map<string, NuGetFetchResult | Error>> {
	const results = new Map<string, NuGetFetchResult | Error>();

	const chunks = chunk(names, concurrency);

	for (const batch of chunks) {
		const promises = batch.map(async (name) => {
			try {
				const data = await fetchPackageWithVersion(name);
				results.set(name, data);
			} catch (error) {
				if (error instanceof HTTPError && error.response.status === 404) {
					results.set(name, new Error(`Package "${name}" not found on NuGet`));
				} else if (error instanceof NuGetSchemaError) {
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
