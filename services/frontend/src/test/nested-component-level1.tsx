import type { Component } from "solid-js";
import { useZero } from "./context/use-zero";
import { NestedComponentLevel2 } from "./nested-component-level2";

export const NestedComponentLevel1: Component = () => {
	const { authState } = useZero();

	return (
		<div style={{ padding: "20px", border: "2px solid blue", margin: "10px" }}>
			<h2>Level 1 Component</h2>
			<p>Auth State from Level 1: {authState()}</p>
			<NestedComponentLevel2 />
		</div>
	);
};
