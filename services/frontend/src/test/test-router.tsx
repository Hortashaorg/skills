import { Route, Router } from "@solidjs/router";
import type { Component } from "solid-js";
import { ZeroProvider } from "./context/zero-provider";
import { TestCallback } from "./test-callback";
import { TestPage } from "./test-page";

export const TestRouter: Component = () => {
	return (
		<ZeroProvider>
			<Router>
				<Route path="/" component={TestPage} />
				<Route path="/auth/callback" component={TestCallback} />
			</Router>
		</ZeroProvider>
	);
};
