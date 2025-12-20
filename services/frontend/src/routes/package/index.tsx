import { queries, type Row, useQuery } from "@package/database/client";
import { A, useParams } from "@solidjs/router";
import { createEffect, createMemo, createSignal, Show } from "solid-js";
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

	// Version selection and search
	const [selectedVersionId, setSelectedVersionId] = createSignal<string>();
	const [versionSearch, setVersionSearch] = createSignal("");

	// Auto-select latest stable version when package loads
	createEffect(() => {
		const p = pkg();
		if (p?.versions && p.versions.length > 0 && !selectedVersionId()) {
			let defaultVersion: PackageVersion | undefined;

			if (p.latestVersion) {
				defaultVersion = p.versions.find((v) => v.version === p.latestVersion);
			}

			if (!defaultVersion) {
				defaultVersion = p.versions.find((v) => !v.isPrerelease);
			}

			if (!defaultVersion) {
				defaultVersion = p.versions[0];
			}

			if (defaultVersion) {
				setSelectedVersionId(defaultVersion.id);
			}
		}
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
									selectedVersionId={selectedVersionId()}
									versionSearch={versionSearch()}
									onVersionChange={setSelectedVersionId}
									onSearchChange={setVersionSearch}
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
