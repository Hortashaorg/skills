import { useConnectionState } from "@package/database/client";
import { createEffect, type ParentComponent } from "solid-js";
import { authApi } from "./auth/auth-api";
import type { AuthData } from "./auth/types";

export const ConnectionStatus: ParentComponent<{
	setAuthData: (data: AuthData | null) => void;
}> = (props) => {
	const state = useConnectionState();

	createEffect(() => {
		console.log(state().name);
		if (state().name === "needs-auth") {
			console.log("Zero needs auth - refreshing token");
			authApi.refresh().then((refreshed) => {
				if (refreshed) {
					props.setAuthData(refreshed);
					console.log("Token refreshed - reconnecting");
				} else {
					console.warn("Refresh failed - logging out");
					props.setAuthData(null);
				}
			});
		}
	});

	return <>{props.children}</>;
};
