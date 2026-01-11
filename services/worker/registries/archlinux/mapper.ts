import type {
	DependencyData,
	PackageData,
	ReleaseChannelData,
} from "../types.ts";
import type { ArchLinuxFetchResult } from "./client.ts";
import type { ArchPackage } from "./schema.ts";

/**
 * Transform Arch Linux API response to common PackageData format.
 */
export function mapArchLinuxPackage(result: ArchLinuxFetchResult): PackageData {
	const { package: pkg } = result;

	const version = pkg.epoch > 0 ? `${pkg.epoch}:${pkg.pkgver}` : pkg.pkgver;

	return {
		name: pkg.pkgname,
		description: pkg.pkgdesc ?? undefined,
		homepage: pkg.url ?? undefined,
		repository: undefined,
		latestVersion: version,
		distTags: { latest: version },
		releaseChannels: mapReleaseChannels(pkg),
	};
}

function mapReleaseChannels(pkg: ArchPackage): ReleaseChannelData[] {
	const version = pkg.epoch > 0 ? `${pkg.epoch}:${pkg.pkgver}` : pkg.pkgver;

	return [
		{
			channel: "latest",
			version,
			publishedAt: new Date(pkg.last_update),
			dependencies: mapDependencies(pkg),
		},
	];
}

function mapDependencies(pkg: ArchPackage): DependencyData[] {
	// Use Map to dedupe by name - first occurrence wins (runtime > optional > dev)
	const depsMap = new Map<string, DependencyData>();

	// Runtime dependencies (highest priority)
	for (const dep of pkg.depends ?? []) {
		const name = parseDepName(dep);
		// Skip shared library dependencies (e.g., libfoo.so, libbar.so.1)
		if (isSharedLibrary(name)) continue;
		if (!depsMap.has(name)) {
			depsMap.set(name, {
				name,
				versionRange: parseDepVersion(dep),
				type: "runtime",
				registry: "archlinux",
			});
		}
	}

	// Optional dependencies (strip description after colon)
	for (const dep of pkg.optdepends ?? []) {
		const rawName = dep.split(":")[0]?.trim();
		if (rawName) {
			const name = parseDepName(rawName);
			if (!depsMap.has(name)) {
				depsMap.set(name, {
					name,
					versionRange: "*",
					type: "optional",
					registry: "archlinux",
				});
			}
		}
	}

	// Make dependencies (build-time, lowest priority)
	for (const dep of pkg.makedepends ?? []) {
		const name = parseDepName(dep);
		if (isSharedLibrary(name)) continue;
		if (!depsMap.has(name)) {
			depsMap.set(name, {
				name,
				versionRange: parseDepVersion(dep),
				type: "dev",
				registry: "archlinux",
			});
		}
	}

	return Array.from(depsMap.values());
}

/**
 * Parse dependency name from Arch format.
 * Examples: "glibc", "openssl>=1.1", "python<3.12"
 */
function parseDepName(dep: string): string {
	// Remove version constraints
	return dep.replace(/[<>=].*$/, "").trim();
}

/**
 * Parse version constraint from Arch format.
 * Examples: "openssl>=1.1" → ">=1.1", "glibc" → "*"
 */
function parseDepVersion(dep: string): string {
	const match = dep.match(/([<>=]+.*)$/);
	return match?.[1] ?? "*";
}

/**
 * Check if dependency is a shared library rather than a package name.
 * Examples: "libgobject-2.0.so", "libfoo.so.1" → true
 */
function isSharedLibrary(name: string): boolean {
	return /\.so(\.\d+)*$/.test(name);
}
