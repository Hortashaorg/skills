import { queries, type Row, useQuery } from "@package/database/client";
import { A, useParams, useSearchParams } from "@solidjs/router";
import { createEffect, createMemo, createSignal, on, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { Layout } from "@/layout/Layout";
import type { Registry } from "@/lib/registries";
import { Dependencies } from "./sections/Dependencies";
import { Header } from "./sections/Header";
import { PackageTags } from "./sections/PackageTags";
import { VersionSelector } from "./sections/VersionSelector";

type PackageVersion = Row["packageVersions"];

export const Package = () => {
	const params = useParams<{ registry: string; name: string }>();
	const [searchParams, setSearchParams] = useSearchParams();

	// Decode URL params
	const registry = () => decodeURIComponent(params.registry) as Registry;
	const packageName = () => decodeURIComponent(params.name);

	// Query package with versions
	const [packageData] = useQuery(() =>
		queries.packages.byNameWithVersions({
			name: packageName(),
			registry: registry(),
		}),
	);

	// Get the package (query filters by name + registry, should be 0 or 1 result)
	const pkg = createMemo(() => {
		const data = packageData();
		return data?.[0] ?? null;
	});

	// Track current package key to detect navigation between packages
	const packageKey = () => `${registry()}:${packageName()}`;

	// Version from URL query param
	const urlVersion = () => searchParams.v as string | undefined;

	// Track if URL version was not found
	const [versionNotFound, setVersionNotFound] = createSignal<string>();

	// Track if URL version was a range that got resolved
	const [resolvedFrom, setResolvedFrom] = createSignal<string>();

	// Version selection
	const [selectedVersionId, setSelectedVersionId] = createSignal<string>();

	// Track last processed package to detect navigation (as signal for proper reactivity)
	const [lastPackageKey, setLastPackageKey] = createSignal("");

	// Sort versions by publishedAt descending (newest first)
	const sortedVersions = createMemo(() => {
		const p = pkg();
		if (!p?.versions?.length) return [];
		return [...p.versions].sort((a, b) => b.publishedAt - a.publishedAt);
	});

	// Find version by version string (exact match, dist-tag, or range)
	const findVersion = (
		versionStr: string,
	): { version: PackageVersion; isResolved: boolean } | undefined => {
		const versions = sortedVersions();
		const p = pkg();
		if (!versions.length) return undefined;

		// Try exact match first
		const exact = versions.find((v) => v.version === versionStr);
		if (exact) return { version: exact, isResolved: false };

		// Try dist-tag (latest, next, etc.)
		const distTags = p?.distTags;
		if (distTags && versionStr in distTags) {
			const tagVersion = distTags[versionStr];
			const found = versions.find((v) => v.version === tagVersion);
			if (found) return { version: found, isResolved: true };
		}

		// For version ranges, try to find a matching version
		const stableVersions = versions.filter(
			(v) => !v.isPrerelease && !v.isYanked,
		);

		// ^X.Y.Z - find latest X.* version
		const caretMatch = versionStr.match(/^\^(\d+)\./);
		if (caretMatch) {
			const major = caretMatch[1];
			const matching = stableVersions.find((v) =>
				v.version.startsWith(`${major}.`),
			);
			if (matching) return { version: matching, isResolved: true };
		}

		// ~X.Y.Z - find latest X.Y.* version
		const tildeMatch = versionStr.match(/^~(\d+\.\d+)\./);
		if (tildeMatch) {
			const majorMinor = tildeMatch[1];
			const matching = stableVersions.find((v) =>
				v.version.startsWith(`${majorMinor}.`),
			);
			if (matching) return { version: matching, isResolved: true };
		}

		// *, x, or other wildcards - latest stable
		if (/^[*x]$/i.test(versionStr) || /[>=<]/.test(versionStr)) {
			const first = stableVersions[0] ?? versions[0];
			if (first) return { version: first, isResolved: true };
		}

		return undefined;
	};

	// Find default version (latest from dist-tags or newest stable)
	const findDefaultVersion = (): PackageVersion | undefined => {
		const versions = sortedVersions();
		const p = pkg();
		if (!versions.length) return undefined;

		// Use latest dist-tag if available
		if (p?.latestVersion) {
			const latest = versions.find((v) => v.version === p.latestVersion);
			if (latest) return latest;
		}

		// Fall back to newest stable version
		return versions.find((v) => !v.isPrerelease && !v.isYanked) ?? versions[0];
	};

	// Initialize version from URL or default when package loads
	createEffect(
		on([pkg, urlVersion, packageKey, sortedVersions], ([p, urlV, key]) => {
			if (!p?.versions?.length) return;

			// Detect navigation to a different package - reset state
			const isNewPackage = key !== lastPackageKey();
			if (isNewPackage) {
				setLastPackageKey(key);
				setSelectedVersionId(undefined);
				setVersionNotFound(undefined);
				setResolvedFrom(undefined);
			}

			// If URL has version param, try to find it
			if (urlV) {
				const result = findVersion(urlV);
				if (result) {
					setSelectedVersionId(result.version.id);
					setVersionNotFound(undefined);
					setResolvedFrom(result.isResolved ? urlV : undefined);
				} else {
					// Version not found - show warning and select default
					setVersionNotFound(urlV);
					setResolvedFrom(undefined);
					const defaultV = findDefaultVersion();
					if (defaultV) setSelectedVersionId(defaultV.id);
				}
			} else {
				// No URL version - select default (don't update URL to keep it clean)
				const defaultV = findDefaultVersion();
				if (defaultV) {
					setSelectedVersionId(defaultV.id);
				}
				setVersionNotFound(undefined);
				setResolvedFrom(undefined);
			}
		}),
	);

	// Update URL when user manually changes version
	const handleVersionChange = (versionId: string | undefined) => {
		setSelectedVersionId(versionId);
		setVersionNotFound(undefined);
		setResolvedFrom(undefined);

		const p = pkg();
		if (versionId && p?.versions) {
			const version = p.versions.find((v) => v.id === versionId);
			if (version) {
				setSearchParams({ v: version.version }, { replace: true });
			}
		}
	};

	// Get selected version object
	const selectedVersion = createMemo(() => {
		const p = pkg();
		const id = selectedVersionId();
		if (!p?.versions || !id) return null;
		return p.versions.find((v) => v.id === id) ?? null;
	});

	return (
		<Layout>
			<Container size="md">
				<Stack spacing="lg" class="py-8">
					<Show
						when={pkg()}
						fallback={
							<Card padding="lg">
								<Stack spacing="md" align="center">
									<Text weight="semibold">Package not found</Text>
									<Text color="muted" size="sm">
										"{packageName()}" on {registry()} is not in our database
										yet.
									</Text>
									<A
										href="/"
										class="text-sm text-primary dark:text-primary-dark hover:underline"
									>
										Search for packages
									</A>
								</Stack>
							</Card>
						}
					>
						{(p) => (
							<>
								{/* Package header */}
								<Header pkg={p()} />

								{/* Tags */}
								<PackageTags packageId={p().id} />

								{/* Version selector */}
								<VersionSelector
									versions={sortedVersions()}
									distTags={p().distTags}
									selectedVersion={selectedVersion()}
									versionNotFound={versionNotFound()}
									resolvedFrom={resolvedFrom()}
									onVersionChange={handleVersionChange}
									registry={p().registry}
									packageName={p().name}
								/>

								{/* Dependencies */}
								<Show when={selectedVersionId()}>
									{(versionId) => (
										<Dependencies
											versionId={versionId()}
											registry={p().registry}
										/>
									)}
								</Show>
							</>
						)}
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};
