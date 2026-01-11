import type { z } from "@package/common";
import ky, { HTTPError } from "ky";
import type {
	JsrDependency,
	JsrPackageResponse,
	JsrVersionResponse,
} from "./schema.ts";
import { schemas } from "./schema.ts";

const JSR_API = "https://api.jsr.io";

/**
 * Error thrown when JSR API response doesn't match expected schema.
 */
export class JsrSchemaError extends Error {
	packageName: string;
	registryName = "jsr";
	zodError: z.ZodError;

	constructor(packageName: string, zodError: z.ZodError) {
		super(
			`JSR API response for "${packageName}" failed schema validation: ${zodError.message}`,
		);
		this.name = "JsrSchemaError";
		this.packageName = packageName;
		this.zodError = zodError;
	}
}

const client = ky.create({
	prefixUrl: JSR_API,
	timeout: 30_000,
	retry: {
		limit: 2,
		methods: ["get"],
		statusCodes: [408, 429, 500, 502, 503, 504],
	},
});

/**
 * Parse a JSR package name into scope and name.
 * JSR packages are always scoped: @scope/name
 */
export function parseJsrName(fullName: string): {
	scope: string;
	name: string;
} {
	const match = fullName.match(/^@([^/]+)\/(.+)$/);
	if (!match || !match[1] || !match[2]) {
		throw new Error(
			`Invalid JSR package name "${fullName}". Must be scoped (@scope/name).`,
		);
	}
	return { scope: match[1], name: match[2] };
}

/**
 * Fetch package metadata from JSR.
 */
export async function fetchPackage(
	fullName: string,
): Promise<JsrPackageResponse> {
	const { scope, name } = parseJsrName(fullName);
	const raw: unknown = await client
		.get(`scopes/${scope}/packages/${name}`)
		.json();

	const parseResult = schemas.package.safeParse(raw);
	if (!parseResult.success) {
		throw new JsrSchemaError(fullName, parseResult.error);
	}

	return parseResult.data;
}

/**
 * Fetch version details from JSR.
 */
export async function fetchVersion(
	fullName: string,
	version: string,
): Promise<JsrVersionResponse> {
	const { scope, name } = parseJsrName(fullName);
	const raw: unknown = await client
		.get(`scopes/${scope}/packages/${name}/versions/${version}`)
		.json();

	const parseResult = schemas.version.safeParse(raw);
	if (!parseResult.success) {
		throw new JsrSchemaError(fullName, parseResult.error);
	}

	return parseResult.data;
}

/**
 * Fetch dependencies for a specific version from JSR.
 * Dependencies are in a separate endpoint from version details.
 */
export async function fetchDependencies(
	fullName: string,
	version: string,
): Promise<JsrDependency[]> {
	const { scope, name } = parseJsrName(fullName);
	const raw: unknown = await client
		.get(`scopes/${scope}/packages/${name}/versions/${version}/dependencies`)
		.json();

	const parseResult = schemas.dependencies.safeParse(raw);
	if (!parseResult.success) {
		throw new JsrSchemaError(fullName, parseResult.error);
	}

	return parseResult.data;
}

export interface JsrFetchResult {
	package: JsrPackageResponse;
	latestVersion: JsrVersionResponse | null;
	dependencies: JsrDependency[];
}

/**
 * Fetch package, its latest version details, and dependencies.
 */
export async function fetchPackageWithVersion(
	fullName: string,
): Promise<JsrFetchResult> {
	const pkg = await fetchPackage(fullName);

	let latestVersion: JsrVersionResponse | null = null;
	let dependencies: JsrDependency[] = [];

	if (pkg.latestVersion) {
		// Fetch version and dependencies in parallel
		const [version, deps] = await Promise.all([
			fetchVersion(fullName, pkg.latestVersion),
			fetchDependencies(fullName, pkg.latestVersion),
		]);
		latestVersion = version;
		dependencies = deps;
	}

	return { package: pkg, latestVersion, dependencies };
}

/**
 * Fetch multiple packages with concurrency control.
 */
export async function fetchPackages(
	names: string[],
	concurrency = 5,
): Promise<Map<string, JsrFetchResult | Error>> {
	const results = new Map<string, JsrFetchResult | Error>();

	const chunks = chunk(names, concurrency);

	for (const batch of chunks) {
		const promises = batch.map(async (name) => {
			try {
				const data = await fetchPackageWithVersion(name);
				results.set(name, data);
			} catch (error) {
				if (error instanceof HTTPError && error.response.status === 404) {
					results.set(name, new Error(`Package "${name}" not found on JSR`));
				} else if (error instanceof JsrSchemaError) {
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
