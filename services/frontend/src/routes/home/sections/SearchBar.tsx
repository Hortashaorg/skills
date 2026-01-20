import {
	EntityFilter,
	type FilterOption,
} from "@/components/composite/entity-filter";
import { Flex } from "@/components/primitives/flex";
import { Input } from "@/components/primitives/input";
import { Select } from "@/components/ui/select";
import { REGISTRY_FILTER_OPTIONS, type RegistryFilter } from "@/lib/registries";

export interface SearchBarProps {
	searchValue: string;
	registryFilter: RegistryFilter;
	selectedTagSlugs: string[];
	tagOptions: readonly FilterOption[];
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
			<EntityFilter
				options={props.tagOptions}
				selectedSlugs={props.selectedTagSlugs}
				onSelectionChange={props.onTagsChange}
			/>
			<Input
				type="text"
				value={props.searchValue}
				onInput={(e) => props.onSearchChange(e.currentTarget.value)}
				placeholder="Search packages..."
				aria-label="Search packages"
				class="flex-1"
			/>
		</Flex>
	);
};
