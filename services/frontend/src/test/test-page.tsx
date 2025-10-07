import type { Component } from "solid-js";
import { useZero } from "./context/use-zero";
import { NestedComponentLevel1 } from "./nested-component-level1";

export const TestPage: Component = () => {
	const { authState } = useZero();

	return (
		<div style={{ padding: "20px", border: "2px solid red" }}>
			<h1>Test Page (Root)</h1>
			<p>Auth State: {authState()}</p>
			<NestedComponentLevel1 />
		</div>
	);
};
