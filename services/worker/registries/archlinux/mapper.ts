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
	const deps: DependencyData[] = [];

	// Runtime dependencies
	for (const dep of pkg.depends ?? []) {
		deps.push({
			name: parseDepName(dep),
			versionRange: parseDepVersion(dep),
			type: "runtime",
			registry: "archlinux",
		});
	}

	// Optional dependencies (strip description after colon)
	for (const dep of pkg.optdepends ?? []) {
		const name = dep.split(":")[0]?.trim();
		if (name) {
			deps.push({
				name: parseDepName(name),
				versionRange: "*",
				type: "optional",
				registry: "archlinux",
			});
		}
	}

	// Make dependencies (build-time)
	for (const dep of pkg.makedepends ?? []) {
		deps.push({
			name: parseDepName(dep),
			versionRange: parseDepVersion(dep),
			type: "dev",
			registry: "archlinux",
		});
	}

	return deps;
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
