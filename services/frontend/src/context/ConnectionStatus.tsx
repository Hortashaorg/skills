import { useConnectionState } from "@package/database/client";
import {
	type Accessor,
	createEffect,
	onCleanup,
	type ParentComponent,
} from "solid-js";
import { authApi } from "./auth/auth-api";
import type { AuthData } from "./auth/types";

const REFRESH_BUFFER_MS = 60 * 1000;

export const ConnectionStatus: ParentComponent<{
	authData: Accessor<AuthData | null>;
	setAuthData: (data: AuthData | null) => void;
}> = (props) => {
	const state = useConnectionState();
	let refreshTimer: ReturnType<typeof setTimeout> | undefined;

	const scheduleProactiveRefresh = (expiresAt: number) => {
		if (refreshTimer) {
			clearTimeout(refreshTimer);
		}

		const now = Date.now();
		const refreshAt = expiresAt - REFRESH_BUFFER_MS;
		const delay = Math.max(0, refreshAt - now);

		refreshTimer = setTimeout(async () => {
			const refreshed = await authApi.refresh();
			if (refreshed) {
				props.setAuthData(refreshed);
			}
		}, delay);
	};

	// Proactive refresh: schedule timer when auth data changes
	createEffect(() => {
		const auth = props.authData();
		if (auth?.expiresAt) {
			scheduleProactiveRefresh(auth.expiresAt);
		}
	});

	// Fallback: reactive refresh on "needs-auth" state
	createEffect(() => {
		if (state().name === "needs-auth") {
			authApi.refresh().then((refreshed) => {
				if (refreshed) {
					props.setAuthData(refreshed);
				} else {
					props.setAuthData(null);
				}
			});
		}
	});

	onCleanup(() => {
		if (refreshTimer) {
			clearTimeout(refreshTimer);
		}
	});

	return <>{props.children}</>;
};
