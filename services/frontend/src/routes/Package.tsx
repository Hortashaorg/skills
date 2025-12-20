import {
	mutators,
	queries,
	type Row,
	useQuery,
	useZero,
} from "@package/database/client";
import { A, useParams } from "@solidjs/router";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, type SelectOption } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { Layout } from "@/layout/Layout";
import { getAuthorizationUrl } from "@/lib/auth-url";
import type { DependencyType, Registry } from "@/lib/registries";

type PackageVersion = Row["packageVersions"];
type PackageDependency = Row["packageDependencies"];

export const Package = () => {
	const params = useParams<{ registry: string; name: string }>();
	const zero = useZero();

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

	// Get the package (first result matching registry)
	const pkg = createMemo(() => {
		const data = packageData();
		if (!data || data.length === 0) return null;
		return data.find((p) => p.registry === registry()) ?? data[0];
	});

	// Version selection
	const [selectedVersionId, setSelectedVersionId] = createSignal<string>();

	// Auto-select latest version when package loads
	createEffect(() => {
		const p = pkg();
		if (p?.versions && p.versions.length > 0 && !selectedVersionId()) {
			// Versions are ordered by publishedAt desc, so first is latest
			const firstVersion = p.versions[0];
			if (firstVersion) {
				setSelectedVersionId(firstVersion.id);
			}
		}
	});

	// Version options for select
	const versionOptions = createMemo((): SelectOption<string>[] => {
		const p = pkg();
		if (!p || !p.versions) return [];
		return p.versions.map((v: PackageVersion) => ({
			value: v.id,
			label: v.version,
		}));
	});

	// Query dependencies for selected version (use a placeholder ID if none selected)
	const [dependencies] = useQuery(() =>
		queries.packageDependencies.byVersionId({
			versionId: selectedVersionId() ?? "",
		}),
	);

	// Group dependencies by type
	const dependenciesByType = createMemo(() => {
		const deps = dependencies() ?? [];
		const grouped: Record<DependencyType, PackageDependency[]> = {
			runtime: [],
			dev: [],
			peer: [],
			optional: [],
		};
		for (const dep of deps) {
			grouped[dep.dependencyType].push(dep);
		}
		return grouped;
	});

	// Count dependencies by type
	const depCounts = createMemo(() => {
		const byType = dependenciesByType();
		return {
			runtime: byType.runtime.length,
			dev: byType.dev.length,
			peer: byType.peer.length,
			optional: byType.optional.length,
		};
	});

	// Request tracking
	const [requestedUpdate, setRequestedUpdate] = createSignal(false);

	const handleRequestUpdate = async () => {
		const p = pkg();
		if (!p) return;

		const write = zero().mutate(
			mutators.packageRequests.create({
				packageName: p.name,
				registry: p.registry,
			}),
		);

		const res = await write.client;

		if (res.type === "error") {
			console.error("Failed to request update:", res.error);
			toast.error("Failed to submit update request. Please try again.");
			return;
		}

		setRequestedUpdate(true);
		toast.success(`Update requested for "${p.name}"`);
	};

	const selectedVersion = createMemo(() => {
		const p = pkg();
		const versionId = selectedVersionId();
		if (!p || !versionId || !p.versions) return null;
		return p.versions.find((v: PackageVersion) => v.id === versionId) ?? null;
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
								<Card padding="lg">
									<Stack spacing="md">
										<Flex justify="between" align="start">
											<Stack spacing="xs">
												<Flex gap="sm" align="center">
													<Heading level="h1">{p().name}</Heading>
													<Badge variant="secondary" size="sm">
														{p().registry}
													</Badge>
												</Flex>
												<Show when={p().description}>
													<Text color="muted">{p().description}</Text>
												</Show>
											</Stack>
										</Flex>

										{/* Links */}
										<Flex gap="lg" wrap="wrap">
											<Show when={p().homepage}>
												{(url) => (
													<a
														href={url()}
														target="_blank"
														rel="noopener noreferrer"
														class="text-sm text-primary dark:text-primary-dark hover:underline"
													>
														Homepage
													</a>
												)}
											</Show>
											<Show when={p().repository}>
												{(url) => (
													<a
														href={url()}
														target="_blank"
														rel="noopener noreferrer"
														class="text-sm text-primary dark:text-primary-dark hover:underline"
													>
														Repository
													</a>
												)}
											</Show>
										</Flex>

										{/* Metadata */}
										<Flex gap="sm" align="center">
											<Text size="xs" color="muted">
												Last updated:{" "}
												{new Date(p().lastFetchSuccess).toLocaleDateString()}
											</Text>
										</Flex>

										{/* Update button */}
										<Flex gap="sm" align="center">
											<Show
												when={!requestedUpdate() && zero().userID !== "anon"}
												fallback={
													<Show when={requestedUpdate()}>
														<Badge variant="info" size="md">
															Update requested
														</Badge>
													</Show>
												}
											>
												<Button variant="outline" onClick={handleRequestUpdate}>
													Request Update
												</Button>
											</Show>
											<Show when={zero().userID === "anon"}>
												<a
													href={getAuthorizationUrl()}
													class="text-sm text-primary dark:text-primary-dark hover:underline"
												>
													Sign in to request updates
												</a>
											</Show>
										</Flex>
									</Stack>
								</Card>

								{/* Version selector */}
								<Show when={versionOptions().length > 0}>
									<Card padding="md">
										<Stack spacing="sm">
											<Text size="sm" weight="semibold">
												Version
											</Text>
											<div class="w-48">
												<Select
													options={versionOptions()}
													value={selectedVersionId()}
													onChange={setSelectedVersionId}
													placeholder="Select version..."
													size="sm"
												/>
											</div>
											<Show when={selectedVersion()}>
												{(v) => (
													<Text size="xs" color="muted">
														Published:{" "}
														{new Date(v().publishedAt).toLocaleDateString()}
													</Text>
												)}
											</Show>
										</Stack>
									</Card>
								</Show>

								{/* Dependencies */}
								<Show when={selectedVersionId()}>
									<Card padding="lg">
										<Stack spacing="md">
											<Heading level="h2">Dependencies</Heading>

											<Show
												when={
													depCounts().runtime > 0 ||
													depCounts().dev > 0 ||
													depCounts().peer > 0 ||
													depCounts().optional > 0
												}
												fallback={
													<Text color="muted" size="sm">
														No dependencies for this version.
													</Text>
												}
											>
												<Tabs.Root defaultValue="runtime">
													<Tabs.List variant="line">
														<Show when={depCounts().runtime > 0}>
															<Tabs.Trigger value="runtime" variant="line">
																Runtime ({depCounts().runtime})
															</Tabs.Trigger>
														</Show>
														<Show when={depCounts().dev > 0}>
															<Tabs.Trigger value="dev" variant="line">
																Dev ({depCounts().dev})
															</Tabs.Trigger>
														</Show>
														<Show when={depCounts().peer > 0}>
															<Tabs.Trigger value="peer" variant="line">
																Peer ({depCounts().peer})
															</Tabs.Trigger>
														</Show>
														<Show when={depCounts().optional > 0}>
															<Tabs.Trigger value="optional" variant="line">
																Optional ({depCounts().optional})
															</Tabs.Trigger>
														</Show>
													</Tabs.List>

													<For
														each={
															["runtime", "dev", "peer", "optional"] as const
														}
													>
														{(depType) => (
															<Tabs.Content value={depType}>
																<Stack spacing="sm" class="mt-4">
																	<For each={dependenciesByType()[depType]}>
																		{(dep) => (
																			<DependencyItem
																				dep={dep}
																				registry={p().registry}
																			/>
																		)}
																	</For>
																</Stack>
															</Tabs.Content>
														)}
													</For>
												</Tabs.Root>
											</Show>
										</Stack>
									</Card>
								</Show>
							</>
						)}
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

// Dependency item component
const DependencyItem = (props: {
	dep: PackageDependency;
	registry: Registry;
}) => {
	return (
		<Flex
			justify="between"
			align="center"
			class="py-2 border-b border-outline/50 dark:border-outline-dark/50 last:border-b-0"
		>
			<Flex gap="sm" align="center">
				<Show
					when={props.dep.dependencyPackageId}
					fallback={
						<Text size="sm" class="text-on-surface dark:text-on-surface-dark">
							{props.dep.dependencyName}
						</Text>
					}
				>
					<A
						href={`/package/${encodeURIComponent(props.registry)}/${encodeURIComponent(props.dep.dependencyName)}`}
						class="text-sm text-primary dark:text-primary-dark hover:underline"
					>
						{props.dep.dependencyName}
					</A>
				</Show>
				<Show when={!props.dep.dependencyPackageId}>
					<Badge variant="secondary" size="sm">
						not fetched
					</Badge>
				</Show>
			</Flex>
			<Text size="xs" color="muted">
				{props.dep.dependencyVersionRange}
			</Text>
		</Flex>
	);
};
