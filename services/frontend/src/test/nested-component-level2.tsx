import type { Component } from "solid-js";
import { useZero } from "./context/use-zero";

export const NestedComponentLevel2: Component = () => {
	const { authState } = useZero();

	return (
		<div style={{ padding: "20px", border: "2px solid green", margin: "10px" }}>
			<h3>Level 2 Component (Deeply Nested)</h3>
			<p>Auth State from Level 2: {authState()}</p>
			<p>✓ Context is accessible deep in the component tree!</p>
		</div>
	);
};
