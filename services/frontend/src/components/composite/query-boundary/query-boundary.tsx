import { type JSX, Match, Switch } from "solid-js";

/**
 * QueryBoundary - Handles loading/empty/data states for Zero queries.
 *
 * Provides a consistent pattern for rendering query results with proper
 * loading and empty state handling.
 *
 * @example
 * // Array data
 * <QueryBoundary
 *   data={packages()}
 *   isLoading={isLoading()}
 *   loadingFallback={<Spinner />}
 *   emptyFallback={<EmptyState title="No packages" />}
 * >
 *   {(packages) => <For each={packages}>{...}</For>}
 * </QueryBoundary>
 *
 * @example
 * // Single object (use hasData for custom empty check)
 * <QueryBoundary
 *   data={pkg()}
 *   isLoading={isLoading()}
 *   hasData={!!pkg()}
 *   loadingFallback={<Spinner />}
 *   emptyFallback={<NotFound />}
 * >
 *   {(pkg) => <PackageDetails pkg={pkg} />}
 * </QueryBoundary>
 */

export interface QueryBoundaryProps<T> {
	/** The query data - can be array, object, or undefined */
	data: T | undefined;
	/** Whether the query is still loading */
	isLoading?: boolean;
	/** Custom check for whether data exists. Defaults to array length check or truthiness. */
	hasData?: boolean;
	/** Fallback to show while loading */
	loadingFallback?: JSX.Element;
	/** Fallback to show when data is empty */
	emptyFallback?: JSX.Element;
	/** Render function called with the data when available */
	children: (data: NonNullable<T>) => JSX.Element;
}

/** Default loading spinner */
const DefaultLoading = () => (
	<div class="flex justify-center py-12">
		<div class="flex items-center gap-2 text-on-surface-muted dark:text-on-surface-dark-muted">
			<svg
				class="animate-spin h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<circle
					class="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="4"
				/>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				/>
			</svg>
			<span class="text-sm">Loading...</span>
		</div>
	</div>
);

/** Check if data has content (works for arrays and objects) */
function hasContent<T>(data: T | undefined, customHasData?: boolean): boolean {
	if (customHasData !== undefined) return customHasData;
	if (data === undefined || data === null) return false;
	if (Array.isArray(data)) return data.length > 0;
	return true;
}

export function QueryBoundary<T>(props: QueryBoundaryProps<T>): JSX.Element {
	return (
		<Switch>
			<Match when={props.isLoading}>
				{props.loadingFallback ?? <DefaultLoading />}
			</Match>
			<Match when={!hasContent(props.data, props.hasData)}>
				{props.emptyFallback}
			</Match>
			<Match when={hasContent(props.data, props.hasData)}>
				{props.children(props.data as NonNullable<T>)}
			</Match>
		</Switch>
	);
}
