import { useConnectionState, useZero } from "@package/database/client";
import { createEffect, Match, type ParentComponent, Switch } from "solid-js";
import { authApi } from "./auth/auth-api";
import type { AuthData } from "./auth/types";

export const ConnectionStatus: ParentComponent<{
	setAuthData: (data: AuthData | null) => void;
}> = (props) => {
	const state = useConnectionState();
	const zero = useZero();

	createEffect(() => {
		if (state().name === "needs-auth") {
			console.log("Zero needs auth - refreshing token");
			authApi.refresh().then((refreshed) => {
				if (refreshed) {
					props.setAuthData(refreshed);
					console.log("Token refreshed - reconnecting");
					zero().connection.connect();
				} else {
					console.warn("Refresh failed - logging out");
					props.setAuthData(null);
				}
			});
		}
	});

	return (
		<Switch>
			<Match when={state().name === "connecting"}>
				<div>Connecting...</div>
				{props.children}
			</Match>

			<Match when={state().name === "connected"}>
				<div>Connected</div>
				{props.children}
			</Match>

			<Match when={state().name === "disconnected"}>
				<div>Offline</div>
				{props.children}
			</Match>

			<Match when={state().name === "error"}>
				<div>Error</div>
				{props.children}
			</Match>

			<Match when={state().name === "needs-auth"}>
				<div>Session expired</div>
				{props.children}
			</Match>
		</Switch>
	);
};
