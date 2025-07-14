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
	accessToken: string;
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
	>("loading");
	const [accessToken, setAccessToken] = createSignal<string | null>(null);

	// Initialize auth and Zero instance
	createEffect(() => {
		initializeAuth();
	});

	const initializeAuth = async () => {
		try {
			// Check for existing access token
			const token = accessToken();

			if (token) {
				initializeZero(token);
				setAuthState("authenticated");
				return;
			}

			const res = await fetch(
				`${import.meta.env.VITE_BACKEND_BASE_URL}/refresh`,
				{
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			if (res.ok) {
				const result = await res.json();
				const access_token =
					result.access_token ?? throwError("Access token not found");

				setAccessToken(access_token);
				initializeZero(access_token);
				setAuthState("authenticated");
				return;
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

	const login = async () => {
		const url = new URL(globalThis.location.href);

		const code =
			url.searchParams.get("code") ??
			throwError("No code provided in search params");
		const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/login`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ code }),
		});

		if (res.ok) {
			const data = await res.json();
			setAccessToken(data.access_token);
			setAuthState("authenticated");
		}
	};

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
