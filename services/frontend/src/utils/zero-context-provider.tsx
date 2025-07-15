import { throwError } from "@package/common";
import { createZero, schema, type Zero } from "@package/database/client";
import {
	createContext,
	createResource,
	createSignal,
	type ParentComponent,
	Show,
	useContext,
} from "solid-js";

export type ZeroContextType = {
	z: Zero<typeof schema>;
	authState: () => "authenticated" | "unauthenticated" | "loading";
	logout: () => void;
	login: () => void;
};

const ZeroContext = createContext<ZeroContextType>();

export const ZeroProvider: ParentComponent = (props) => {
	const [authState, setAuthState] = createSignal<
		"loading" | "unauthenticated" | "authenticated"
	>("loading");
	const [accessToken, setAccessToken] = createSignal<string | null>(null);

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

	const logout = async () => {};

	const getContext = () => {
		const zeroInstance = createZero({
			userID: "anon", // You might want to get this from the token
			server: "http://localhost:4848",
			schema,
			// Add auth headers if needed
			// headers: { Authorization: `Bearer ${token}` }
		}) as Zero<typeof schema>;

		return {
			z: zeroInstance,
			authState: authState,
			logout: logout,
			login: login,
		};
	};

	const initializeAuth = async () => {
		try {
			// Check for existing access token
			const token = accessToken();

			if (token) {
				setAuthState("authenticated");
				return getContext();
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
				setAuthState("authenticated");
				return getContext();
			}

			// No valid token, user needs to login
			setAuthState("unauthenticated");
			return getContext();
		} catch (error) {
			console.error("Auth initialization failed:", error);
			setAuthState("unauthenticated");
			return getContext();
		}
	};

	const [provider] = createResource<ZeroContextType>(async () => {
		return initializeAuth();
	});

	return (
		<Show when={provider()} fallback={<div>Loading...</div>}>
			<ZeroContext.Provider value={provider()}>
				{props.children}
			</ZeroContext.Provider>
		</Show>
	);
};

export const useZero = <T extends ZeroContextType>() => {
	const context = useContext(ZeroContext);
	console.log("useZero", context);
	if (!context) {
		throw new Error("useZero must be used within a ZeroProvider");
	}
	return context as T;
};
