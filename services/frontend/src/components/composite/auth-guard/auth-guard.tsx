import type { JSX, ParentComponent } from "solid-js";
import { Show } from "solid-js";

export interface AuthGuardProps {
	hasAccess: boolean;
	fallback?: JSX.Element;
}

export const AuthGuard: ParentComponent<AuthGuardProps> = (props) => {
	return (
		<Show when={props.hasAccess} fallback={props.fallback}>
			{props.children}
		</Show>
	);
};
