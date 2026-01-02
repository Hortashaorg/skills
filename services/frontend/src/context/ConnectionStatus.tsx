import { useConnectionState } from "@package/database/client";
import { createEffect, type ParentComponent } from "solid-js";
import { authApi } from "./auth/auth-api";
import type { AuthData } from "./auth/types";

export const ConnectionStatus: ParentComponent<{
	setAuthData: (data: AuthData | null) => void;
}> = (props) => {
	const state = useConnectionState();

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

	return <>{props.children}</>;
};
