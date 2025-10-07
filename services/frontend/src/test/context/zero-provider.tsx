import {
	createContext,
	createResource,
	type ParentComponent,
	Show,
} from "solid-js";
import { AuthService } from "../auth/auth-service";
import { createAuthState } from "../auth/auth-state";
import type { AuthData, AuthState } from "../types";

export type ZeroContextType = {
	authState: () => AuthState;
	authData: () => AuthData | null;
	login: () => Promise<void>;
};

export const ZeroContext = createContext<ZeroContextType>();

export const ZeroProvider: ParentComponent = (props) => {
	const { authState, setAuthState, authData, setAuthData } = createAuthState();
	const authService = new AuthService();

	const login = async () => {
		const url = new URL(window.location.href);
		const code = url.searchParams.get("code");

		if (!code) {
			throw new Error("No code provided in URL");
		}

		try {
			const data = await authService.login(code);
			setAuthData(data);
			setAuthState("authenticated");
			// Clear the code from URL
			window.history.replaceState({}, "", window.location.pathname);
		} catch (error) {
			console.error("Login failed:", error);
			throw error;
		}
	};

	const initializeContext = async (): Promise<ZeroContextType> => {
		// Try to refresh token to restore session
		const data = await authService.refresh();

		if (data) {
			// Successfully restored session
			setAuthData(data);
			setAuthState("authenticated");
		} else {
			// No valid session
			setAuthState("unauthenticated");
		}

		return {
			authState,
			authData,
			login,
		};
	};

	const [contextValue] = createResource<ZeroContextType>(initializeContext);

	return (
		<Show
			when={contextValue()}
			fallback={<div>Initializing application...</div>}
		>
			<ZeroContext.Provider value={contextValue()}>
				{props.children}
			</ZeroContext.Provider>
		</Show>
	);
};
