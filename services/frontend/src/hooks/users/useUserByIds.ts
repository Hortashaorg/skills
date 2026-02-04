import type { Row } from "@package/database/client";
import { queries, useQuery } from "@package/database/client";
import { type Accessor, createMemo } from "solid-js";

export type User = Row["account"];

export interface UseUserByIdsResult {
	users: Accessor<Map<string, User>>;
	isLoading: Accessor<boolean>;
}

/**
 * Hook for fetching users by IDs.
 *
 * Returns a Map for O(1) lookup by ID.
 * Supports both single and batch lookups.
 *
 * @example Single lookup
 * ```tsx
 * const { users, isLoading } = useUserByIds(() => [userId]);
 * const user = () => users().get(userId);
 * ```
 *
 * @example Batch lookup
 * ```tsx
 * const { users, isLoading } = useUserByIds(() => [id1, id2, id3]);
 *
 * <For each={ids}>
 *   {id => <UserCard user={users().get(id)} />}
 * </For>
 * ```
 */
export function useUserByIds(
	ids: Accessor<readonly string[]>,
): UseUserByIdsResult {
	const [data, result] = useQuery(() => {
		const idList = ids();
		if (idList.length === 0) return null;
		return queries.account.byIds({ ids: [...idList] });
	});

	const users = createMemo(() => {
		const map = new Map<string, User>();
		for (const user of data() ?? []) {
			map.set(user.id, user);
		}
		return map;
	});

	const isLoading = () => {
		if (ids().length === 0) return false;
		return result().type !== "complete";
	};

	return {
		users,
		isLoading,
	};
}
