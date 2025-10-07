import { type Component, Show } from "solid-js";
import { useZero } from "./context/use-zero";
import { NestedComponentLevel1 } from "./nested-component-level1";

export const TestPage: Component = () => {
	const { authState, authData } = useZero();

	return (
		<div style={{ padding: "20px", border: "2px solid red" }}>
			<h1>Test Page (Root)</h1>
			<p>Auth State: {authState()}</p>
			<Show when={authData()}>
				<p>User ID: {authData()?.userId}</p>
				<p>Access Token: {authData()?.accessToken.substring(0, 20)}...</p>
			</Show>
			<NestedComponentLevel1 />
		</div>
	);
};
