import { Route, Router } from "@solidjs/router";
import type { Component } from "solid-js";
import { Home } from "@/routes/Home";
import { ZeroProvider } from "./context/zero-provider";
import { TestCallback } from "./test-callback";

export const TestRouter: Component = () => {
	return (
		<ZeroProvider>
			<Router>
				<Route path="/" component={Home} />
				<Route path="/auth/callback" component={TestCallback} />
			</Router>
		</ZeroProvider>
	);
};
