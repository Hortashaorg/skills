import type { Component } from "solid-js";
import { useZero } from "./context/use-zero";

export const NestedComponentLevel2: Component = () => {
	const { authState, z } = useZero();

	const testZeroMutation = () => {
		console.log("Testing Zero mutation...");
		z.mutate.test.create("Test from Level 2 component");
	};

	return (
		<div style={{ padding: "20px", border: "2px solid green", margin: "10px" }}>
			<h3>Level 2 Component (Deeply Nested)</h3>
			<p>Auth State from Level 2: {authState()}</p>
			<p>✓ Context is accessible deep in the component tree!</p>
			<p>✓ Zero instance available: {z ? "Yes" : "No"}</p>
			<button type="button" onClick={testZeroMutation}>
				Test Zero Mutation
			</button>
		</div>
	);
};
