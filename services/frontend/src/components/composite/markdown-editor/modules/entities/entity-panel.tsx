import { createSignal, For, type JSX, Match, Show, Switch } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Input } from "@/components/primitives/input";
import { cn } from "@/lib/utils";
import type { ToolbarContext } from "../../markdown-editor-types";

type EntityType = "package" | "ecosystem" | "project" | "user";

const ENTITY_TYPES: { type: EntityType; label: string }[] = [
	{ type: "package", label: "Package" },
	{ type: "ecosystem", label: "Ecosystem" },
	{ type: "project", label: "Project" },
	{ type: "user", label: "User" },
];

interface EntityPanelProps {
	ctx: ToolbarContext;
}

export const EntityPanel = (props: EntityPanelProps) => {
	const [selectedType, setSelectedType] = createSignal<EntityType>("package");

	const handleInsert = (type: EntityType, id: string) => {
		// Insert entity reference in format $$type:id (double $ for uniqueness)
		props.ctx.insert(`$$${type}:${id}`);
		props.ctx.closePanel();
	};

	return (
		<div class="flex flex-col sm:flex-row gap-2 w-full">
			{/* Entity type selector */}
			<select
				value={selectedType()}
				onChange={(e) => setSelectedType(e.currentTarget.value as EntityType)}
				class={cn(
					"px-2 py-1.5 text-sm rounded-radius border border-outline dark:border-outline-dark",
					"bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark",
					"focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark",
				)}
			>
				<For each={ENTITY_TYPES}>
					{(entity) => <option value={entity.type}>{entity.label}</option>}
				</For>
			</select>

			{/* Search section based on type */}
			<div class="flex-1 min-w-0">
				<Switch>
					<Match when={selectedType() === "package"}>
						<PackageSearch ctx={props.ctx} onInsert={handleInsert} />
					</Match>
					<Match when={selectedType() === "ecosystem"}>
						<EcosystemSearch ctx={props.ctx} onInsert={handleInsert} />
					</Match>
					<Match when={selectedType() === "project"}>
						<ProjectSearch ctx={props.ctx} onInsert={handleInsert} />
					</Match>
					<Match when={selectedType() === "user"}>
						<UserSearch ctx={props.ctx} onInsert={handleInsert} />
					</Match>
				</Switch>
			</div>
		</div>
	);
};

// ─────────────────────────────────────────────────────────────────────────────
// Package Search
// ─────────────────────────────────────────────────────────────────────────────

interface SearchProps {
	ctx: ToolbarContext;
	onInsert: (type: EntityType, id: string) => void;
}

const PackageSearch = (props: SearchProps) => {
	const search = props.ctx.search.packages;
	const hasResults = () =>
		search.results().length > 0 || search.exactMatches().length > 0;

	return (
		<SearchCombobox
			placeholder="Search packages..."
			query={search.query()}
			onQueryChange={search.setQuery}
			isLoading={search.isLoading()}
			hasResults={hasResults()}
		>
			<For each={search.exactMatches()}>
				{(pkg) => (
					<SearchResultItem
						name={pkg.name}
						meta={pkg.registry}
						onClick={() => props.onInsert("package", pkg.id)}
					/>
				)}
			</For>
			<For each={search.results()}>
				{(pkg) => (
					<SearchResultItem
						name={pkg.name}
						meta={pkg.registry}
						onClick={() => props.onInsert("package", pkg.id)}
					/>
				)}
			</For>
		</SearchCombobox>
	);
};

// ─────────────────────────────────────────────────────────────────────────────
// Ecosystem Search
// ─────────────────────────────────────────────────────────────────────────────

const EcosystemSearch = (props: SearchProps) => {
	const search = props.ctx.search.ecosystems;
	const hasResults = () => search.results().length > 0 || !!search.exactMatch();

	return (
		<SearchCombobox
			placeholder="Search ecosystems..."
			query={search.query()}
			onQueryChange={search.setQuery}
			isLoading={search.isLoading()}
			hasResults={hasResults()}
		>
			<Show when={search.exactMatch()}>
				{(eco) => (
					<SearchResultItem
						name={eco().name}
						onClick={() => props.onInsert("ecosystem", eco().id)}
					/>
				)}
			</Show>
			<For each={search.results()}>
				{(eco) => (
					<SearchResultItem
						name={eco.name}
						onClick={() => props.onInsert("ecosystem", eco.id)}
					/>
				)}
			</For>
		</SearchCombobox>
	);
};

// ─────────────────────────────────────────────────────────────────────────────
// Project Search
// ─────────────────────────────────────────────────────────────────────────────

const ProjectSearch = (props: SearchProps) => {
	const search = props.ctx.search.projects;
	const hasResults = () => search.results().length > 0 || !!search.exactMatch();

	return (
		<SearchCombobox
			placeholder="Search projects..."
			query={search.query()}
			onQueryChange={search.setQuery}
			isLoading={search.isLoading()}
			hasResults={hasResults()}
		>
			<Show when={search.exactMatch()}>
				{(proj) => (
					<SearchResultItem
						name={proj().name}
						onClick={() => props.onInsert("project", proj().id)}
					/>
				)}
			</Show>
			<For each={search.results()}>
				{(proj) => (
					<SearchResultItem
						name={proj.name}
						onClick={() => props.onInsert("project", proj.id)}
					/>
				)}
			</For>
		</SearchCombobox>
	);
};

// ─────────────────────────────────────────────────────────────────────────────
// User Search
// ─────────────────────────────────────────────────────────────────────────────

const UserSearch = (props: SearchProps) => {
	const search = props.ctx.search.users;
	const hasResults = () => search.results().length > 0 || !!search.exactMatch();

	return (
		<SearchCombobox
			placeholder="Search users..."
			query={search.query()}
			onQueryChange={search.setQuery}
			isLoading={search.isLoading()}
			hasResults={hasResults()}
		>
			<Show when={search.exactMatch()}>
				{(user) => (
					<SearchResultItem
						name={user().name ?? user().id}
						onClick={() => props.onInsert("user", user().id)}
					/>
				)}
			</Show>
			<For each={search.results()}>
				{(user) => (
					<SearchResultItem
						name={user.name ?? user.id}
						onClick={() => props.onInsert("user", user.id)}
					/>
				)}
			</For>
		</SearchCombobox>
	);
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared Components
// ─────────────────────────────────────────────────────────────────────────────

interface SearchComboboxProps {
	placeholder: string;
	query: string;
	onQueryChange: (value: string) => void;
	isLoading: boolean;
	hasResults: boolean;
	children: JSX.Element;
}

const SearchCombobox = (props: SearchComboboxProps) => {
	const [isFocused, setIsFocused] = createSignal(false);
	const showDropdown = () => isFocused() && (props.hasResults || props.query);

	return (
		<div class="relative flex-1">
			<Input
				type="text"
				size="sm"
				placeholder={props.placeholder}
				value={props.query}
				onInput={(e) => props.onQueryChange(e.currentTarget.value)}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setTimeout(() => setIsFocused(false), 150)}
				autofocus
				class="w-full"
			/>
			<Show when={showDropdown()}>
				<div
					class={cn(
						"absolute z-50 top-full left-0 right-0 mt-1",
						"max-h-40 overflow-y-auto rounded-radius shadow-lg",
						"border border-outline dark:border-outline-dark",
						"bg-surface dark:bg-surface-dark",
					)}
				>
					<Show
						when={!props.isLoading}
						fallback={
							<div class="px-3 py-2 text-xs text-on-surface-muted dark:text-on-surface-dark-muted">
								Searching...
							</div>
						}
					>
						<Show
							when={props.hasResults}
							fallback={
								<div class="px-3 py-2 text-xs text-on-surface-muted dark:text-on-surface-dark-muted">
									No results
								</div>
							}
						>
							{props.children}
						</Show>
					</Show>
				</div>
			</Show>
		</div>
	);
};

interface SearchResultItemProps {
	name: string;
	meta?: string;
	onClick: () => void;
}

const SearchResultItem = (props: SearchResultItemProps) => (
	<button
		type="button"
		onClick={props.onClick}
		class={cn(
			"w-full px-3 py-1.5 text-left text-sm transition-colors",
			"hover:bg-surface-alt dark:hover:bg-surface-dark-alt",
			"focus:bg-surface-alt dark:focus:bg-surface-dark-alt focus:outline-none",
		)}
	>
		<Flex justify="between" align="center" gap="sm">
			<span class="truncate text-on-surface dark:text-on-surface-dark">
				{props.name}
			</span>
			<Show when={props.meta}>
				<span class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted shrink-0">
					{props.meta}
				</span>
			</Show>
		</Flex>
	</button>
);
