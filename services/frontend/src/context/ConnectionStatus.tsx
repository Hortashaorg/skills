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

		console.log(
			"[ConnectionStatus] Scheduling proactive refresh in",
			Math.round(delay / 1000),
			"seconds",
		);

		refreshTimer = setTimeout(async () => {
			console.log("[ConnectionStatus] Proactive refresh timer fired");
			const refreshed = await authApi.refresh();
			if (refreshed) {
				props.setAuthData(refreshed);
			} else {
				console.log("[ConnectionStatus] Proactive refresh returned null");
			}
		}, delay);
	};

	// Proactive refresh: schedule timer when auth data changes
	createEffect(() => {
		const auth = props.authData();
		if (auth?.expiresAt) {
			const timeUntilExpiry = auth.expiresAt - Date.now();
			console.log(
				"[ConnectionStatus] Auth data changed - expires in",
				Math.round(timeUntilExpiry / 1000),
				"seconds",
			);
			scheduleProactiveRefresh(auth.expiresAt);
		}
	});

	// Fallback: reactive refresh on "needs-auth" state
	createEffect(() => {
		const currentState = state();
		console.log("[ConnectionStatus] Zero state:", currentState.name);
		if (currentState.name === "needs-auth") {
			console.log("[ConnectionStatus] Fallback refresh triggered (needs-auth)");
			authApi.refresh().then((refreshed) => {
				if (refreshed) {
					props.setAuthData(refreshed);
				} else {
					console.log(
						"[ConnectionStatus] Fallback refresh returned null - logging out",
					);
					props.setAuthData(null);
				}
			});
		}
	});

	// Visibility-based refresh: check token when tab becomes visible
	const handleVisibilityChange = () => {
		if (document.visibilityState === "visible") {
			const auth = props.authData();
			if (!auth?.expiresAt) return;

			const timeUntilExpiry = auth.expiresAt - Date.now();
			console.log(
				"[ConnectionStatus] Tab visible - token expires in",
				Math.round(timeUntilExpiry / 1000),
				"seconds",
			);

			// If token is expired or will expire within buffer, refresh immediately
			if (timeUntilExpiry < REFRESH_BUFFER_MS) {
				console.log(
					"[ConnectionStatus] Token expired/expiring - refreshing immediately",
				);
				authApi.refresh().then((refreshed) => {
					if (refreshed) {
						props.setAuthData(refreshed);
					} else {
						console.log("[ConnectionStatus] Visibility refresh returned null");
					}
				});
			}
		}
	};

	document.addEventListener("visibilitychange", handleVisibilityChange);

	onCleanup(() => {
		if (refreshTimer) {
			clearTimeout(refreshTimer);
		}
		document.removeEventListener("visibilitychange", handleVisibilityChange);
	});

	return <>{props.children}</>;
};
