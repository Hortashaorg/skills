/* @refresh reload */
import { render } from "solid-js/web";
import { Home } from "./Home.tsx";
import "./index.css";
import { Route, Router } from "@solidjs/router";
import { Callback } from "./auth/callback/Callback.tsx";
import { ZeroProvider } from "./utils/zero-context-provider.tsx";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
	);
}

if (!root) throw new Error("Root element not found");

render(
	() => (
		<ZeroProvider>
			<Router>
				<Route path="/" component={Home} />
				<Route path="/auth/callback" component={Callback} />
			</Router>
		</ZeroProvider>
	),
	root,
);
