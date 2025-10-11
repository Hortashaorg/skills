import {
	createContext,
	createResource,
	type ParentComponent,
	Show,
} from "solid-js";
import { AuthService } from "@/lib/auth/auth-service";
import { createAuthState } from "@/lib/auth/auth-state";
import type { AuthData, AuthState } from "@/lib/auth/types";

export type AuthContextType = {
	authState: () => AuthState;
	authData: () => AuthData | null;
	login: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>();

export const AuthProvider: ParentComponent = (props) => {
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

	const initializeAuth = async (): Promise<AuthContextType> => {
		// Check if we have an OAuth code in the URL
		const url = new URL(window.location.href);
		const code = url.searchParams.get("code");

		let authDataResult: AuthData | null = null;

		if (code) {
			// We have an OAuth code - exchange it for tokens
			try {
				authDataResult = await authService.login(code);
				setAuthData(authDataResult);
				setAuthState("authenticated");
				// Clear the code from URL
				window.history.replaceState({}, "", window.location.pathname);
			} catch (error) {
				console.error("Login with code failed:", error);
			}
		}

		// If we didn't just login, try to refresh token to restore session
		if (!authDataResult) {
			authDataResult = await authService.refresh();
			if (authDataResult) {
				setAuthData(authDataResult);
				setAuthState("authenticated");
			}
		}

		// If still no auth data, set as unauthenticated
		if (!authDataResult) {
			setAuthState("unauthenticated");
		}

		return {
			authState,
			authData,
			login,
		};
	};

	const [contextValue] = createResource<AuthContextType>(initializeAuth);

	return (
		<Show
			when={contextValue()}
			fallback={<div>Initializing authentication...</div>}
		>
			<AuthContext.Provider value={contextValue()}>
				{props.children}
			</AuthContext.Provider>
		</Show>
	);
};
