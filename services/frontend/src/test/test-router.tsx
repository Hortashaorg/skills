import type { Component } from "solid-js";
import { ZeroProvider } from "./context/zero-provider";
import { TestPage } from "./test-page";

export const TestRouter: Component = () => {
	return (
		<ZeroProvider>
			<TestPage />
		</ZeroProvider>
	);
};
