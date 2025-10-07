import { type Component, Show } from "solid-js";
import { useZero } from "./context/use-zero";
import { NestedComponentLevel1 } from "./nested-component-level1";

export const TestPage: Component = () => {
	const { authState, authData } = useZero();

	return (
		<div style={{ padding: "20px", border: "2px solid red" }}>
			<h1>Test Page (Root)</h1>
			<p>Auth State: {authState()}</p>

			<Show when={authState() === "unauthenticated"}>
				<div>
					<p>You are not logged in.</p>
					<a href={import.meta.env.VITE_URL}>
						<button type="button">Login with OAuth</button>
					</a>
				</div>
			</Show>

			<Show when={authState() === "authenticated"}>
				<div>
					<p>✓ Successfully logged in!</p>
					<p>User ID: {authData()?.userId}</p>
					<p>Access Token: {authData()?.accessToken.substring(0, 20)}...</p>
				</div>
			</Show>

			<NestedComponentLevel1 />
		</div>
	);
};
