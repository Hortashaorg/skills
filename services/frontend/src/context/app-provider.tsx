import { mutators, schema, ZeroProvider } from "@package/database/client";
import { createSignal, onMount, type ParentComponent, Show } from "solid-js";
import { toast } from "@/components/ui/toast";
import { getAndClearReturnUrl } from "@/lib/auth-url";
import { getConfig } from "@/lib/config";
import { authApi } from "./auth/auth-api";
import type { AuthData } from "./auth/types";
import { ConnectionStatus } from "./ConnectionStatus";

let _setAuthData: ((data: AuthData | null) => void) | undefined;
let _getAuthData: (() => AuthData | null) | undefined;

export const logout = async () => {
	if (!_setAuthData)
		throw new Error("logout called before AppProvider mounted");
	await authApi.logout();
	_setAuthData(null);
};

export const getAuthData = () => {
	if (!_getAuthData)
		throw new Error("getAuthData called before AppProvider mounted");
	return _getAuthData();
};

export const AppProvider: ParentComponent = (props) => {
	const [authData, setAuthData] = createSignal<AuthData | null>(null);
	const [authLoading, setAuthLoading] = createSignal(true);

	// Separate signal for access token - updates don't trigger ZeroProvider identity changes
	const [accessToken, setAccessToken] = createSignal<string | null>(null);

	// Wrap setAuthData to update both signals, but only update identity when it changes
	const updateAuth = (data: AuthData | null) => {
		setAccessToken(data?.accessToken ?? null);

		const current = authData();
		const identityChanged =
			current?.userId !== data?.userId ||
			JSON.stringify(current?.roles) !== JSON.stringify(data?.roles);

		if (identityChanged) {
			setAuthData(data);
		}
	};

	_setAuthData = updateAuth;
	_getAuthData = authData;

	onMount(async () => {
		const url = new URL(window.location.href);
		const code = url.searchParams.get("code");

		if (code) {
			try {
				const data = await authApi.login(code);
				updateAuth(data);

				const returnUrl = getAndClearReturnUrl();
				if (returnUrl) {
					window.history.replaceState({}, "", returnUrl);
					window.location.replace(returnUrl);
				} else {
					window.history.replaceState({}, "", window.location.pathname);
				}
			} catch (error) {
				console.error("Login with code failed:", error);
				toast.error("Sign in failed. Please try again.");
			} finally {
				setAuthLoading(false);
			}
		} else {
			try {
				const data = await authApi.refresh();
				if (data) {
					updateAuth(data);
				}
			} catch (error) {
				console.error("Token refresh failed:", error);
				toast.error("Session expired. Please sign in again.");
			} finally {
				setAuthLoading(false);
			}
		}
	});

	return (
		<Show when={!authLoading()} fallback={<div class="min-h-screen" />}>
			<ZeroProvider
				userID={authData()?.userId ?? "anon"}
				auth={accessToken()}
				context={{
					userID: authData()?.userId ?? "anon",
					roles: authData()?.roles ?? [],
				}}
				schema={schema}
				mutators={mutators}
				cacheURL={getConfig().zeroUrl}
				disconnectTimeoutMs={1000 * 30}
			>
				<ConnectionStatus authData={authData} setAuthData={updateAuth}>
					{props.children}
				</ConnectionStatus>
			</ZeroProvider>
		</Show>
	);
};
