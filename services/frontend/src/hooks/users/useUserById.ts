import type { Row } from "@package/database/client";
import { queries, useQuery } from "@package/database/client";
import type { Accessor } from "solid-js";

export type User = Row["account"];

export interface UseUserByIdResult {
	user: Accessor<User | null>;
	isLoading: Accessor<boolean>;
}

/**
 * Hook to fetch a single user by ID.
 *
 * @example
 * ```tsx
 * const { user, isLoading } = useUserById(() => params.id);
 *
 * <Show when={!isLoading()} fallback={<Skeleton />}>
 *   <UserProfile user={user()!} />
 * </Show>
 * ```
 */
export function useUserById(
	id: Accessor<string | null | undefined>,
): UseUserByIdResult {
	const [user, userResult] = useQuery(() => {
		const userId = id();
		return userId ? queries.account.byId({ id: userId }) : null;
	});

	const isLoading = () => {
		const userId = id();
		if (!userId) return false;
		return userResult().type !== "complete";
	};

	return {
		user: () => user() ?? null,
		isLoading,
	};
}
