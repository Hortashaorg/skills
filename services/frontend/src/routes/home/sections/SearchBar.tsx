import { Flex } from "@/components/primitives/flex";
import { Select } from "@/components/ui/select";
import { REGISTRY_FILTER_OPTIONS, type RegistryFilter } from "@/lib/registries";
import { TagFilter } from "./TagFilter";

export interface SearchBarProps {
	searchValue: string;
	registryFilter: RegistryFilter;
	selectedTagSlugs: string[];
	onSearchChange: (value: string) => void;
	onRegistryChange: (value: RegistryFilter) => void;
	onTagsChange: (slugs: string[]) => void;
}

export const SearchBar = (props: SearchBarProps) => {
	return (
		<Flex gap="sm" align="stretch">
			<Select
				options={REGISTRY_FILTER_OPTIONS}
				value={props.registryFilter}
				onChange={props.onRegistryChange}
				aria-label="Filter by registry"
				class="w-auto"
			/>
			<TagFilter
				selectedTagSlugs={props.selectedTagSlugs}
				onTagsChange={props.onTagsChange}
			/>
			<div class="flex-1">
				<input
					type="text"
					value={props.searchValue}
					onInput={(e) => props.onSearchChange(e.currentTarget.value)}
					placeholder="Search packages..."
					aria-label="Search packages"
					class="flex h-10 w-full rounded-md border border-outline dark:border-outline-dark bg-transparent px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark placeholder:text-on-surface-subtle dark:placeholder:text-on-surface-dark-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2"
				/>
			</div>
		</Flex>
	);
};
