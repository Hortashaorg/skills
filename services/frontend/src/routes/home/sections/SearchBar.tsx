import { For } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { REGISTRY_FILTER_OPTIONS, type RegistryFilter } from "@/lib/registries";

export interface SearchBarProps {
	searchValue: string;
	registryFilter: RegistryFilter;
	onSearchChange: (value: string) => void;
	onRegistryChange: (value: RegistryFilter) => void;
}

export const SearchBar = (props: SearchBarProps) => {
	const handleRegistryChange = (
		e: Event & { currentTarget: HTMLSelectElement },
	) => {
		props.onRegistryChange(e.currentTarget.value as RegistryFilter);
	};

	return (
		<Flex gap="sm" align="stretch">
			<select
				value={props.registryFilter}
				onChange={handleRegistryChange}
				class="h-10 rounded-md border border-outline dark:border-outline-dark bg-surface dark:bg-surface-dark px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 cursor-pointer"
			>
				<For each={REGISTRY_FILTER_OPTIONS}>
					{(option) => <option value={option.value}>{option.label}</option>}
				</For>
			</select>
			<div class="flex-1">
				<input
					type="text"
					value={props.searchValue}
					onInput={(e) => props.onSearchChange(e.currentTarget.value)}
					placeholder="Search packages..."
					class="flex h-10 w-full rounded-md border border-outline dark:border-outline-dark bg-transparent px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark placeholder:text-on-surface-subtle dark:placeholder:text-on-surface-dark-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2"
				/>
			</div>
		</Flex>
	);
};
