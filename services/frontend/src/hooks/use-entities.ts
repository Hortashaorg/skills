import type { Accessor } from "solid-js";

// ─────────────────────────────────────────────────────────────────────────────
// Re-export types from individual hooks
// ─────────────────────────────────────────────────────────────────────────────

// Ecosystem types
export type {
	EcosystemWithRelations,
	UseEcosystemByIdResult,
} from "./ecosystems/useEcosystemById";
export type {
	Ecosystem as EcosystemFromByIds,
	UseEcosystemByIdsResult,
} from "./ecosystems/useEcosystemByIds";
export type {
	Ecosystem,
	UseEcosystemSearchOptions,
	UseEcosystemSearchResult,
} from "./ecosystems/useEcosystemSearch";
// Package types
export type {
	PackageWithTags,
	UsePackageByIdResult,
} from "./packages/usePackageById";
export type {
	Package as PackageFromByIds,
	UsePackageByIdsResult,
} from "./packages/usePackageByIds";
export type {
	Package,
	UsePackageSearchOptions,
	UsePackageSearchResult,
} from "./packages/usePackageSearch";

// Project types
export type {
	Project as ProjectWithDetails,
	UseProjectByIdResult,
} from "./projects/useProjectById";
export type {
	Project as ProjectFromByIds,
	UseProjectByIdsResult,
} from "./projects/useProjectByIds";
export type {
	Project,
	UseProjectSearchOptions,
	UseProjectSearchResult,
} from "./projects/useProjectSearch";

// User types
export type { User as UserBasic, UseUserByIdResult } from "./users/useUserById";
export type {
	User as UserFromByIds,
	UseUserByIdsResult,
} from "./users/useUserByIds";
export type {
	User,
	UseUserSearchOptions,
	UseUserSearchResult,
} from "./users/useUserSearch";

// ─────────────────────────────────────────────────────────────────────────────
// Import hooks
// ─────────────────────────────────────────────────────────────────────────────

import {
	type UseEcosystemByIdResult,
	useEcosystemById,
} from "./ecosystems/useEcosystemById";
import {
	type UseEcosystemByIdsResult,
	useEcosystemByIds,
} from "./ecosystems/useEcosystemByIds";
import {
	type UseEcosystemSearchOptions,
	type UseEcosystemSearchResult,
	useEcosystemSearch,
} from "./ecosystems/useEcosystemSearch";
import {
	type UsePackageByIdResult,
	usePackageById,
} from "./packages/usePackageById";
import {
	type UsePackageByIdsResult,
	usePackageByIds,
} from "./packages/usePackageByIds";
import {
	type UsePackageSearchOptions,
	type UsePackageSearchResult,
	usePackageSearch,
} from "./packages/usePackageSearch";

import {
	type UseProjectByIdResult,
	useProjectById,
} from "./projects/useProjectById";
import {
	type UseProjectByIdsResult,
	useProjectByIds,
} from "./projects/useProjectByIds";
import {
	type UseProjectSearchOptions,
	type UseProjectSearchResult,
	useProjectSearch,
} from "./projects/useProjectSearch";

import { type UseUserByIdResult, useUserById } from "./users/useUserById";
import { type UseUserByIdsResult, useUserByIds } from "./users/useUserByIds";
import {
	type UseUserSearchOptions,
	type UseUserSearchResult,
	useUserSearch,
} from "./users/useUserSearch";

// ─────────────────────────────────────────────────────────────────────────────
// Unified interface
// ─────────────────────────────────────────────────────────────────────────────

export interface EntitySearch {
	packages: (options: UsePackageSearchOptions) => UsePackageSearchResult;
	ecosystems: (options: UseEcosystemSearchOptions) => UseEcosystemSearchResult;
	projects: (options: UseProjectSearchOptions) => UseProjectSearchResult;
	users: (options: UseUserSearchOptions) => UseUserSearchResult;
}

export interface EntityById {
	package: (id: Accessor<string | null | undefined>) => UsePackageByIdResult;
	ecosystem: (
		id: Accessor<string | null | undefined>,
	) => UseEcosystemByIdResult;
	project: (id: Accessor<string | null | undefined>) => UseProjectByIdResult;
	user: (id: Accessor<string | null | undefined>) => UseUserByIdResult;
}

export interface EntityByIds {
	packages: (ids: Accessor<readonly string[]>) => UsePackageByIdsResult;
	ecosystems: (ids: Accessor<readonly string[]>) => UseEcosystemByIdsResult;
	projects: (ids: Accessor<readonly string[]>) => UseProjectByIdsResult;
	users: (ids: Accessor<readonly string[]>) => UseUserByIdsResult;
}

export interface UseEntitiesResult {
	search: EntitySearch;
	byId: EntityById;
	byIds: EntityByIds;
}

/**
 * Unified hook providing access to all entity search, byId, and byIds hooks.
 *
 * Groups hooks logically so you can think "I need search hooks" or "I need byId hooks".
 *
 * @example Search for packages
 * ```tsx
 * const entities = useEntities();
 * const packageSearch = entities.search.packages({ showRecentWhenEmpty: true });
 *
 * <Input value={packageSearch.query()} onInput={e => packageSearch.setQuery(e.target.value)} />
 * <For each={packageSearch.results()}>{pkg => <PackageCard package={pkg} />}</For>
 * ```
 *
 * @example Fetch a single user by ID
 * ```tsx
 * const entities = useEntities();
 * const { user, isLoading } = entities.byId.user(() => params.userId);
 *
 * <Show when={!isLoading()}>
 *   <UserProfile user={user()!} />
 * </Show>
 * ```
 *
 * @example Batch fetch packages by IDs
 * ```tsx
 * const entities = useEntities();
 * const { packages, isLoading } = entities.byIds.packages(() => packageIds);
 *
 * <For each={packageIds}>
 *   {id => <PackageCard package={packages().get(id)} />}
 * </For>
 * ```
 */
export function useEntities(): UseEntitiesResult {
	return {
		search: {
			packages: usePackageSearch,
			ecosystems: useEcosystemSearch,
			projects: useProjectSearch,
			users: useUserSearch,
		},
		byId: {
			package: usePackageById,
			ecosystem: useEcosystemById,
			project: useProjectById,
			user: useUserById,
		},
		byIds: {
			packages: usePackageByIds,
			ecosystems: useEcosystemByIds,
			projects: useProjectByIds,
			users: useUserByIds,
		},
	};
}
