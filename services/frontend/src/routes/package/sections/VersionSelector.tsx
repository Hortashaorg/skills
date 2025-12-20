import { Combobox } from "@kobalte/core/combobox";
import { mutators, type Row, useZero } from "@package/database/client";
import { createMemo, createSignal, For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import type { Registry } from "@/lib/registries";

type PackageVersion = Row["packageVersions"];

export interface VersionSelectorProps {
	versions: readonly PackageVersion[];
	distTags: Record<string, string> | null;
	selectedVersion: PackageVersion | null;
	versionNotFound: string | undefined;
	onVersionChange: (versionId: string | undefined) => void;
	registry: Registry;
	packageName: string;
}

export const VersionSelector = (props: VersionSelectorProps) => {
	const zero = useZero();
	const [inputValue, setInputValue] = createSignal("");
	const [isOpen, setIsOpen] = createSignal(false);
	const [requestedUpdate, setRequestedUpdate] = createSignal(false);

	// Filter versions based on input
	const filteredVersions = createMemo(() => {
		const search = inputValue().toLowerCase().trim();
		if (!search) {
			// Show recent stable versions by default
			return [...props.versions].filter((v) => !v.isYanked).slice(0, 20);
		}
		return [...props.versions].filter((v) =>
			v.version.toLowerCase().includes(search),
		);
	});

	// Get dist-tags as array for display
	const distTagsArray = createMemo(() => {
		const tags = props.distTags;
		if (!tags) return [];
		return Object.entries(tags).map(([tag, version]) => ({ tag, version }));
	});

	// Handle selecting a version from dropdown
	const handleSelect = (version: PackageVersion | null) => {
		if (version) {
			props.onVersionChange(version.id);
			setInputValue("");
			setIsOpen(false);
		}
	};

	// Handle clicking a dist-tag pill
	const handleDistTagClick = (version: string) => {
		const found = props.versions.find((v) => v.version === version);
		if (found) {
			props.onVersionChange(found.id);
		}
	};

	// Handle requesting an update for missing version
	const handleRequestUpdate = async () => {
		const write = zero().mutate(
			mutators.packageRequests.create({
				packageName: props.packageName,
				registry: props.registry,
			}),
		);

		const res = await write.client;

		if (res.type === "error") {
			console.error("Failed to request update:", res.error);
			toast.error("Failed to submit update request. Please try again.");
			return;
		}

		setRequestedUpdate(true);
		toast.success(`Update requested for "${props.packageName}"`);
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
						<Flex gap="sm" wrap="wrap">
							<For each={distTagsArray()}>
								{({ tag, version }) => {
									const isSelected = () =>
										props.selectedVersion?.version === version;
									return (
										<button
											type="button"
											onClick={() => handleDistTagClick(version)}
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
					</Show>

					{/* Version combobox */}
					<Combobox<PackageVersion>
						value={props.selectedVersion}
						onChange={handleSelect}
						onInputChange={setInputValue}
						open={isOpen()}
						onOpenChange={setIsOpen}
						options={filteredVersions()}
						optionValue="id"
						optionTextValue="version"
						optionLabel="version"
						placeholder="Search or enter version..."
						allowsEmptyCollection={true}
						shouldFocusWrap={true}
						itemComponent={(itemProps) => (
							<Combobox.Item
								item={itemProps.item}
								class="w-full text-left px-3 py-2 hover:bg-surface-alt dark:hover:bg-surface-dark-alt ui-highlighted:bg-surface-alt dark:ui-highlighted:bg-surface-dark-alt transition-colors cursor-pointer outline-none"
							>
								<Flex justify="between" align="center">
									<Flex gap="sm" align="center">
										<Text size="sm">{itemProps.item.rawValue.version}</Text>
										<Show when={itemProps.item.rawValue.isPrerelease}>
											<Badge variant="warning" size="sm">
												pre
											</Badge>
										</Show>
										<Show when={itemProps.item.rawValue.isYanked}>
											<Badge variant="danger" size="sm">
												yanked
											</Badge>
										</Show>
									</Flex>
									<Text size="xs" color="muted">
										{new Date(
											itemProps.item.rawValue.publishedAt,
										).toLocaleDateString()}
									</Text>
								</Flex>
							</Combobox.Item>
						)}
					>
						<Combobox.Control class="relative">
							<Combobox.Input class="flex h-10 w-full rounded-md border border-outline dark:border-outline-dark bg-transparent px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark placeholder:text-on-surface-subtle dark:placeholder:text-on-surface-dark-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 pr-8" />
							<Combobox.Trigger class="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-subtle dark:text-on-surface-dark-subtle">
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
									<title>Toggle</title>
									<path d="m6 9 6 6 6-6" />
								</svg>
							</Combobox.Trigger>
						</Combobox.Control>

						<Combobox.Portal>
							<Combobox.Content class="z-50 mt-1 w-(--kb-popper-anchor-width) bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-md shadow-lg max-h-60 overflow-auto ui-expanded:animate-in ui-expanded:fade-in-0 ui-expanded:zoom-in-95 ui-closed:animate-out ui-closed:fade-out-0 ui-closed:zoom-out-95">
								<Combobox.Listbox class="flex flex-col" />
								<Show when={inputValue() && filteredVersions().length === 0}>
									<div class="p-3 text-center">
										<Text size="sm" color="muted">
											No matching versions
										</Text>
									</div>
								</Show>
							</Combobox.Content>
						</Combobox.Portal>
					</Combobox>

					{/* Selected version info */}
					<Show when={props.selectedVersion}>
						{(v) => (
							<Flex gap="sm" align="center" wrap="wrap">
								<Text size="xs" color="muted">
									Published: {new Date(v().publishedAt).toLocaleDateString()}
								</Text>
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
						)}
					</Show>

					{/* Version not found state */}
					<Show when={props.versionNotFound}>
						{(version) => (
							<Card
								padding="sm"
								class="bg-warning/10 dark:bg-warning-dark/10 border-warning dark:border-warning-dark"
							>
								<Stack spacing="sm">
									<Text size="sm" weight="semibold">
										Version "{version()}" not found
									</Text>
									<Text size="xs" color="muted">
										This version may not be in our database yet.
										{props.selectedVersion && (
											<> Showing {props.selectedVersion.version} instead.</>
										)}
									</Text>
									<Show when={!requestedUpdate() && zero().userID !== "anon"}>
										<Button
											variant="outline"
											size="sm"
											onClick={handleRequestUpdate}
										>
											Request package update
										</Button>
									</Show>
									<Show when={requestedUpdate()}>
										<Badge variant="info" size="sm">
											Update requested
										</Badge>
									</Show>
									<Show when={zero().userID === "anon"}>
										<Text size="xs" color="muted">
											Sign in to request an update.
										</Text>
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
