import { throwError } from "@package/common";
import { createZero, schema, type Zero } from "@package/database/client";
import {
	type Accessor,
	createContext,
	createEffect,
	createSignal,
	type ParentComponent,
	useContext,
} from "solid-js";

export type Unauthenticated = {
	authState: () => "unauthenticated";
	login: () => void;
};

export type Authenticated = {
	z: Zero<typeof schema>;
	authState: () => "authenticated";
	logout: () => void;
};

export type Loading = {
	authState: () => "loading";
};

export type ZeroContextType = Unauthenticated | Authenticated | Loading;

const ZeroContext = createContext<ZeroContextType>();

export const ZeroProvider: ParentComponent = (props) => {
	const [z, setZ] = createSignal<Zero<typeof schema> | null>(null);
	const [authState, setAuthState] = createSignal<
		"loading" | "unauthenticated" | "authenticated"
	>("unauthenticated");

	// Initialize auth and Zero instance
	createEffect(() => {
		initializeAuth();
	});

	const initializeAuth = async () => {
		try {
			// Check for existing access token
			const accessToken = localStorage.getItem("access_token");

			if (accessToken) {
				// Verify token is still valid (you might want to call an API endpoint)
				if (await isTokenValid(accessToken)) {
					initializeZero(accessToken);
					setAuthState("authenticated");
					return;
				}
			}

			// Try to refresh token
			const refreshToken = localStorage.getItem("refresh_token");
			if (refreshToken) {
				const newToken = await refreshAccessToken(refreshToken);
				if (newToken) {
					localStorage.setItem("access_token", newToken);
					initializeZero(newToken);
					setAuthState("authenticated");
					return;
				}
			}

			// No valid token, user needs to login
			setAuthState("unauthenticated");
		} catch (error) {
			console.error("Auth initialization failed:", error);
			setAuthState("unauthenticated");
		}
	};

	const initializeZero = (_token: string) => {
		const zeroInstance = createZero({
			userID: "anon", // You might want to get this from the token
			server: "http://localhost:4848",
			schema,
			// Add auth headers if needed
			// headers: { Authorization: `Bearer ${token}` }
		}) as Zero<typeof schema>;

		setZ(zeroInstance);
	};

	const login = () => {
		const url = new URL(globalThis.location.href);

		const code =
			url.searchParams.get("code") ??
			throwError("No code provided in search params");
		fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/login`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ code }),
		});
	};

	const logout = () => {
		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
		setZ(null);
		setAuthState("unauthenticated");
	};

	// Helper functions (implement these based on your auth system)
	const isTokenValid = async (_token: string): Promise<boolean> => {
		// Implement token validation logic
		// This could be a simple expiry check or an API call
		return true; // Placeholder
	};

	const refreshAccessToken = async (
		_refreshToken: string,
	): Promise<string | null> => {
		// Implement token refresh logic
		// Make API call to refresh endpoint
		return null; // Placeholder
	};

	if (authState() === "authenticated") {
		const contextValue: ZeroContextType = {
			z: z() ?? throwError("Should be authenticated"),
			authState: authState as Accessor<"authenticated">,
			logout,
		};

		return (
			<ZeroContext.Provider value={contextValue}>
				{props.children}
			</ZeroContext.Provider>
		);
	}

	if (authState() === "unauthenticated") {
		const contextValue: ZeroContextType = {
			authState: authState as Accessor<"unauthenticated">,
			login,
		};
		return (
			<ZeroContext.Provider value={contextValue}>
				{props.children}
			</ZeroContext.Provider>
		);
	}

	const contextValue: ZeroContextType = {
		authState: authState as Accessor<"loading">,
	};
	return (
		<ZeroContext.Provider value={contextValue}>
			{props.children}
		</ZeroContext.Provider>
	);
};

export const useZero = <T extends ZeroContextType>() => {
	const context = useContext(ZeroContext);
	if (!context) {
		throw new Error("useZero must be used within a ZeroProvider");
	}
	return context as T;
};
