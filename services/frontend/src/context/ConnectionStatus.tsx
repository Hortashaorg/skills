import { useConnectionState, useZero } from "@package/database/client";
import { createEffect, type ParentComponent } from "solid-js";
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

	return <>{props.children}</>;
};
