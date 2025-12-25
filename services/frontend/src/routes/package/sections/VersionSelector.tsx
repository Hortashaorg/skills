import type { Row } from "@package/database/client";
import { useNavigate } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createPackageRequest } from "@/hooks/createPackageRequest";
import type { Registry } from "@/lib/registries";

type PackageVersion = Row["packageVersions"];

export interface VersionSelectorProps {
	versions: readonly PackageVersion[];
	distTags: Record<string, string> | null;
	selectedVersion: PackageVersion | null;
	versionNotFound: string | undefined;
	resolvedFrom: string | undefined;
	onVersionChange: (versionId: string | undefined) => void;
	registry: Registry;
	packageName: string;
}

export const VersionSelector = (props: VersionSelectorProps) => {
	const navigate = useNavigate();
	const [inputValue, setInputValue] = createSignal("");
	const request = createPackageRequest(() => ({
		packageName: props.packageName,
		registry: props.registry,
	}));

	// Get dist-tags as array for display
	const distTagsArray = createMemo(() => {
		const tags = props.distTags;
		if (!tags) return [];
		return Object.entries(tags).map(([tag, version]) => ({ tag, version }));
	});

	// Get 5 most recent stable versions (already sorted by publishedAt desc)
	const recentVersions = createMemo(() => {
		return props.versions
			.filter((v) => !v.isPrerelease && !v.isYanked)
			.slice(0, 5);
	});

	// Handle clicking a version button
	const handleVersionClick = (version: string) => {
		const found = props.versions.find((v) => v.version === version);
		if (found) {
			props.onVersionChange(found.id);
		}
	};

	// Handle Find button click - navigate with version in URL
	const handleFind = () => {
		const version = inputValue().trim();
		if (!version) return;

		const encodedRegistry = encodeURIComponent(props.registry);
		const encodedName = encodeURIComponent(props.packageName);
		const encodedVersion = encodeURIComponent(version);
		navigate(`/package/${encodedRegistry}/${encodedName}?v=${encodedVersion}`);
		setInputValue("");
	};

	// Handle Enter key in input
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			handleFind();
		}
	};

	return (
		<Show when={props.versions.length > 0}>
			<Card padding="md">
				<Stack spacing="md">
					{/* Header */}
					<Flex justify="between" align="center">
						<Text size="sm" weight="semibold">
							Version
						</Text>
						<Text size="xs" color="muted">
							{props.versions.length} versions
						</Text>
					</Flex>

					{/* Dist-tags quick select */}
					<Show when={distTagsArray().length > 0}>
						<Stack spacing="xs">
							<Text size="xs" color="muted">
								Tags
							</Text>
							<Flex gap="sm" wrap="wrap">
								<For each={distTagsArray()}>
									{({ tag, version }) => {
										const isSelected = () =>
											props.selectedVersion?.version === version &&
											!props.resolvedFrom;
										return (
											<button
												type="button"
												onClick={() => handleVersionClick(version)}
												class={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-radius text-sm font-medium transition-colors cursor-pointer border ${
													isSelected()
														? "bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark border-primary dark:border-primary-dark"
														: "bg-surface-alt dark:bg-surface-dark-alt text-on-surface dark:text-on-surface-dark border-outline dark:border-outline-dark hover:bg-surface dark:hover:bg-surface-dark"
												}`}
											>
												<span class="text-xs opacity-70">{tag}:</span>
												<span>{version}</span>
											</button>
										);
									}}
								</For>
							</Flex>
						</Stack>
					</Show>

					{/* Recent versions quick select */}
					<Show when={recentVersions().length > 0}>
						<Stack spacing="xs">
							<Text size="xs" color="muted">
								Recent
							</Text>
							<Flex gap="sm" wrap="wrap">
								<For each={recentVersions()}>
									{(v) => {
										const isSelected = () =>
											props.selectedVersion?.id === v.id && !props.resolvedFrom;
										return (
											<button
												type="button"
												onClick={() => handleVersionClick(v.version)}
												class={`px-3 py-1.5 rounded-radius text-sm font-medium transition-colors cursor-pointer border ${
													isSelected()
														? "bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark border-primary dark:border-primary-dark"
														: "bg-surface-alt dark:bg-surface-dark-alt text-on-surface dark:text-on-surface-dark border-outline dark:border-outline-dark hover:bg-surface dark:hover:bg-surface-dark"
												}`}
											>
												{v.version}
											</button>
										);
									}}
								</For>
							</Flex>
						</Stack>
					</Show>

					{/* Version input */}
					<Flex gap="sm">
						<input
							type="text"
							value={inputValue()}
							onInput={(e) => setInputValue(e.currentTarget.value)}
							onKeyDown={handleKeyDown}
							placeholder="Enter version or range..."
							class="flex-1 h-10 rounded-md border border-outline dark:border-outline-dark bg-transparent px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark placeholder:text-on-surface-subtle dark:placeholder:text-on-surface-dark-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark"
						/>
						<Button variant="outline" size="md" onClick={handleFind}>
							Find
						</Button>
					</Flex>

					{/* Current version status */}
					<Show when={props.selectedVersion}>
						{(v) => (
							<Card
								padding="sm"
								class={
									props.versionNotFound
										? "bg-warning/10 dark:bg-warning-dark/10 border-warning dark:border-warning-dark"
										: "bg-surface-alt dark:bg-surface-dark-alt"
								}
							>
								<Stack spacing="sm">
									<Flex gap="sm" align="center" wrap="wrap">
										{/* Show URL version if it differs from selected */}
										<Show when={props.resolvedFrom || props.versionNotFound}>
											<Badge
												variant={
													props.versionNotFound ? "warning" : "secondary"
												}
												size="md"
											>
												{props.resolvedFrom || props.versionNotFound}
											</Badge>
											<Text size="sm" color="muted">
												{props.versionNotFound ? "not found →" : "→"}
											</Text>
										</Show>

										{/* Always show resolved/selected version */}
										<Badge variant="primary" size="md">
											{v().version}
										</Badge>

										<Show when={v().isPrerelease}>
											<Badge variant="warning" size="sm">
												pre-release
											</Badge>
										</Show>
										<Show when={v().isYanked}>
											<Badge variant="danger" size="sm">
												yanked
											</Badge>
										</Show>
									</Flex>

									<Text size="xs" color="muted">
										Published: {new Date(v().publishedAt).toLocaleDateString()}
									</Text>

									{/* Request update option for not found versions */}
									<Show when={props.versionNotFound}>
										<Show
											when={!request.isRequested() && !request.isDisabled()}
										>
											<Button
												variant="outline"
												size="sm"
												onClick={() => request.submit()}
											>
												Request package update
											</Button>
										</Show>
										<Show when={request.isRequested()}>
											<Badge variant="info" size="sm">
												Update requested
											</Badge>
										</Show>
										<Show when={request.isDisabled()}>
											<Text size="xs" color="muted">
												Sign in to request an update.
											</Text>
										</Show>
									</Show>
								</Stack>
							</Card>
						)}
					</Show>
				</Stack>
			</Card>
		</Show>
	);
};
