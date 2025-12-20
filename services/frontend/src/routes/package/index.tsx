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

	// Version from URL query param
	const urlVersion = () => searchParams.v as string | undefined;

	// Track if URL version was not found
	const [versionNotFound, setVersionNotFound] = createSignal<string>();

	// Version selection
	const [selectedVersionId, setSelectedVersionId] = createSignal<string>();

	// Find version by version string (exact match or latest matching for ranges)
	const findVersion = (
		versions: readonly PackageVersion[],
		versionStr: string,
	): PackageVersion | undefined => {
		// Try exact match first
		const exact = versions.find((v) => v.version === versionStr);
		if (exact) return exact;

		// For version ranges (^, ~, >=, etc.), find latest stable version as approximation
		if (/[\^~>=<]/.test(versionStr)) {
			const stable = versions.find((v) => !v.isPrerelease && !v.isYanked);
			return stable ?? versions[0];
		}

		return undefined;
	};

	// Find default version (latest stable)
	const findDefaultVersion = (
		p: NonNullable<ReturnType<typeof pkg>>,
	): PackageVersion | undefined => {
		if (!p.versions?.length) return undefined;

		if (p.latestVersion) {
			const latest = p.versions.find((v) => v.version === p.latestVersion);
			if (latest) return latest;
		}

		return p.versions.find((v) => !v.isPrerelease) ?? p.versions[0];
	};

	// Initialize version from URL or default when package loads
	createEffect(
		on([pkg, urlVersion], ([p, urlV]) => {
			if (!p?.versions?.length) return;

			// If URL has version param, try to find it
			if (urlV) {
				const found = findVersion(p.versions, urlV);
				if (found) {
					setSelectedVersionId(found.id);
					setVersionNotFound(undefined);
				} else {
					setVersionNotFound(urlV);
					// Still select default so dependencies section works
					const defaultV = findDefaultVersion(p);
					if (defaultV) setSelectedVersionId(defaultV.id);
				}
			} else {
				// No URL version - select default and update URL
				const defaultV = findDefaultVersion(p);
				if (defaultV) {
					setSelectedVersionId(defaultV.id);
					setSearchParams({ v: defaultV.version }, { replace: true });
				}
			}
		}),
	);

	// Update URL when user manually changes version
	const handleVersionChange = (versionId: string | undefined) => {
		setSelectedVersionId(versionId);
		setVersionNotFound(undefined);

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
					{/* Back link */}
					<A
						href="/"
						class="inline-flex items-center gap-1 text-sm text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark transition-colors"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<title>Back</title>
							<path d="m15 18-6-6 6-6" />
						</svg>
						Back to search
					</A>

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

								{/* Version selector */}
								<VersionSelector
									versions={p().versions ?? []}
									distTags={p().distTags}
									selectedVersion={selectedVersion()}
									versionNotFound={versionNotFound()}
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
