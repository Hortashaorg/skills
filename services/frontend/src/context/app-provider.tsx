import { mutators, schema, ZeroProvider } from "@package/database/client";
import { createSignal, onMount, type ParentComponent, Show } from "solid-js";
import { getAndClearReturnUrl } from "@/lib/auth-url";
import { getConfig } from "@/lib/config";
import { authApi } from "./auth/auth-api";
import { type AuthData, EmailUnverifiedError } from "./auth/types";
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

	_setAuthData = setAuthData;
	_getAuthData = authData;

	onMount(async () => {
		const url = new URL(window.location.href);
		const code = url.searchParams.get("code");

		if (code) {
			try {
				const data = await authApi.login(code);
				setAuthData(data);

				const returnUrl = getAndClearReturnUrl();
				if (returnUrl) {
					window.history.replaceState({}, "", returnUrl);
					window.location.replace(returnUrl);
				} else {
					window.history.replaceState({}, "", window.location.pathname);
				}
			} catch (error) {
				if (error instanceof EmailUnverifiedError) {
					window.location.href = "/verify-email";
					return;
				}
				console.error("Login with code failed:", error);
			} finally {
				setAuthLoading(false);
			}
		} else {
			try {
				const data = await authApi.refresh();
				if (data) {
					setAuthData(data);
				}
			} catch (error) {
				if (error instanceof EmailUnverifiedError) {
					window.location.href = "/verify-email";
					return;
				}
				console.error("Token refresh failed:", error);
			} finally {
				setAuthLoading(false);
			}
		}
	});

	return (
		<Show when={!authLoading()} fallback={<div class="min-h-screen" />}>
			<ZeroProvider
				userID={authData()?.userId ?? "anon"}
				auth={authData()?.accessToken ?? null}
				context={{
					userID: authData()?.userId ?? "anon",
					roles: authData()?.roles ?? [],
				}}
				schema={schema}
				mutators={mutators}
				cacheURL={getConfig().zeroUrl}
				disconnectTimeoutMs={1000 * 30}
			>
				<ConnectionStatus authData={authData} setAuthData={setAuthData}>
					{props.children}
				</ConnectionStatus>
			</ZeroProvider>
		</Show>
	);
};
