import { type JSX, Match, Switch } from "solid-js";
import { Spinner } from "@/components/ui/spinner";

/**
 * QueryBoundary - Handles loading/empty/data states for Zero queries.
 *
 * Use result.type from useQuery for accurate loading state:
 * - "complete" = server has responded, data is authoritative
 * - "unknown" = local data only, server not yet confirmed
 * - "error" = query failed
 *
 * @example
 * // Recommended: use result.type for loading
 * const [packages, result] = useQuery(queries.packages.list);
 *
 * <QueryBoundary
 *   data={packages()}
 *   isLoading={result().type !== "complete"}
 *   emptyFallback={<EmptyState title="No packages" />}
 * >
 *   {(packages) => <For each={packages}>{...}</For>}
 * </QueryBoundary>
 *
 * @example
 * // Single object (use hasData for custom empty check)
 * const [pkg, result] = useQuery(() => queries.packages.byName({ name }));
 *
 * <QueryBoundary
 *   data={pkg()}
 *   isLoading={result().type !== "complete"}
 *   hasData={!!pkg()}
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
		<Spinner label="Loading..." />
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
