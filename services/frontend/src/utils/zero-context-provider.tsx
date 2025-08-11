import { throwError } from "@package/common";
import {
	createMutators,
	createZero,
	type Mutators,
	schema,
	type Zero,
} from "@package/database/client";
import {
	createContext,
	createResource,
	createSignal,
	type ParentComponent,
	Show,
	useContext,
} from "solid-js";

export type ZeroContextType = {
	z: Zero<typeof schema, Mutators>;
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
	const [userId, setUserId] = createSignal<string | null>(null);

	// Login function to be exposed
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
			setUserId(data.sub);
			setAuthState("authenticated");
			globalThis.location.href = "/";
		}
	};

	// Logout function to be exposed
	const logout = async () => {};

	// Builds the context when called
	const getContext = () => {
		let zeroInstance = createZero({
			userID: "anon",
			server: "http://localhost:4848",
			schema,
			mutators: createMutators(),
		}) as Zero<typeof schema, Mutators>;

		if (accessToken()) {
			zeroInstance = createZero({
				auth: accessToken() as string,
				userID: userId() as string,
				server: "http://localhost:4848",
				schema,
				mutators: createMutators(),
			});
		}

		return {
			z: zeroInstance,
			authState: authState,
			logout: logout,
			login: login,
		};
	};

	// Check for or attempt to fetch access token on app load
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
				setAccessToken(result.access_token);
				setUserId(result.sub);
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
	if (!context) {
		throw new Error("useZero must be used within a ZeroProvider");
	}
	return context as T;
};
