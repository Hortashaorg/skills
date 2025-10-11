import { createSignal } from "solid-js";
import type { AuthData, AuthState } from "./types";

export const createAuthState = () => {
	const [authState, setAuthState] = createSignal<AuthState>("loading");
	const [authData, setAuthData] = createSignal<AuthData | null>(null);

	return {
		authState,
		setAuthState,
		authData,
		setAuthData,
	};
};
