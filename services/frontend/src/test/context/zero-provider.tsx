import type { Mutators, schema, Zero } from "@package/database/client";
import {
	createContext,
	createResource,
	type ParentComponent,
	Show,
} from "solid-js";
import { AuthService } from "../auth/auth-service";
import { createAuthState } from "../auth/auth-state";
import type { AuthData, AuthState } from "../types";
import { ZeroFactory } from "../zero/zero-factory";

export type ZeroContextType = {
	authState: () => AuthState;
	authData: () => AuthData | null;
	login: () => Promise<void>;
	z: Zero<typeof schema, Mutators>;
};

export const ZeroContext = createContext<ZeroContextType>();

export const ZeroProvider: ParentComponent = (props) => {
	const { authState, setAuthState, authData, setAuthData } = createAuthState();
	const authService = new AuthService();
	const zeroFactory = new ZeroFactory();

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

		let zeroInstance: Zero<typeof schema, Mutators>;

		if (authDataResult) {
			zeroInstance = zeroFactory.createAuthenticated(authDataResult);
		} else {
			// No valid session
			setAuthState("unauthenticated");
			zeroInstance = zeroFactory.createAnonymous();
		}

		return {
			authState,
			authData,
			login,
			z: zeroInstance,
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
