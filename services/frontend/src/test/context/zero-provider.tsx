import {
	createContext,
	createResource,
	type ParentComponent,
	Show,
} from "solid-js";
import { createAuthState } from "../auth/auth-state";
import type { AuthState } from "../types";

export type ZeroContextType = {
	authState: () => AuthState;
};

export const ZeroContext = createContext<ZeroContextType>();

export const ZeroProvider: ParentComponent = (props) => {
	const { authState, setAuthState } = createAuthState();

	const initializeContext = async (): Promise<ZeroContextType> => {
		// Simulate initialization delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// For now, just set to unauthenticated after loading
		setAuthState("unauthenticated");

		return {
			authState,
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
