import type { Row } from "@package/database/client";
import { createMemo, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, type SelectOption } from "@/components/ui/select";

type PackageVersion = Row["packageVersions"];

const MAX_DROPDOWN_VERSIONS = 15;

export interface VersionSelectorProps {
	versions: readonly PackageVersion[];
	selectedVersionId: string | undefined;
	versionSearch: string;
	onVersionChange: (versionId: string | undefined) => void;
	onSearchChange: (search: string) => void;
}

export const VersionSelector = (props: VersionSelectorProps) => {
	// Filter versions based on search, show stable first, limit count
	const filteredVersions = createMemo(() => {
		const search = props.versionSearch.toLowerCase().trim();
		let versions = [...props.versions];

		// Filter out yanked versions unless specifically searching
		if (!search) {
			versions = versions.filter((v) => !v.isYanked);
		}

		// If searching, filter by search term
		if (search) {
			versions = versions.filter((v) =>
				v.version.toLowerCase().includes(search),
			);
		} else {
			// When not searching, prioritize stable versions
			const stable = versions.filter((v) => !v.isPrerelease);
			if (stable.length > 0) {
				versions = stable.slice(0, MAX_DROPDOWN_VERSIONS);
			} else {
				versions = versions.slice(0, MAX_DROPDOWN_VERSIONS);
			}
		}

		return versions;
	});

	// Version options for select dropdown
	const versionOptions = createMemo((): SelectOption<string>[] => {
		return filteredVersions().map((v) => ({
			value: v.id,
			label: v.version,
		}));
	});

	// Check if there are more versions than shown
	const hasMoreVersions = createMemo(() => {
		return (
			props.versions.length > MAX_DROPDOWN_VERSIONS && !props.versionSearch
		);
	});

	// Get selected version details
	const selectedVersion = createMemo(() => {
		if (!props.selectedVersionId) return null;
		return props.versions.find((v) => v.id === props.selectedVersionId) ?? null;
	});

	return (
		<Show when={props.versions.length > 0}>
			<Card padding="md">
				<Stack spacing="sm">
					<Flex justify="between" align="center">
						<Text size="sm" weight="semibold">
							Version
						</Text>
						<Text size="xs" color="muted">
							{props.versions.length} versions
						</Text>
					</Flex>
					<Flex gap="sm" align="stretch">
						<div class="w-48">
							<Select
								options={versionOptions()}
								value={props.selectedVersionId}
								onChange={props.onVersionChange}
								placeholder="Select version..."
								size="sm"
							/>
						</div>
						<input
							type="text"
							value={props.versionSearch}
							onInput={(e) => props.onSearchChange(e.currentTarget.value)}
							placeholder="Search versions..."
							class="flex h-8 w-40 rounded-md border border-outline dark:border-outline-dark bg-transparent px-2 py-1 text-xs text-on-surface dark:text-on-surface-dark placeholder:text-on-surface-subtle dark:placeholder:text-on-surface-dark-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-1"
						/>
					</Flex>
					<Show when={hasMoreVersions()}>
						<Text size="xs" color="muted">
							Showing {MAX_DROPDOWN_VERSIONS} stable versions. Search to find
							older or pre-release versions.
						</Text>
					</Show>
					<Show when={selectedVersion()}>
						{(v) => (
							<Flex gap="sm" align="center">
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
				</Stack>
			</Card>
		</Show>
	);
};
