/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import "./index.css";
import { AuthProvider } from "./context/auth-provider";
import { ZeroWrapper } from "./context/zero-wrapper";
import { Callback } from "./routes/Callback";
import { Home } from "./routes/Home";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
	);
}

if (!root) throw new Error("Root element not found");

render(
	() => (
		<AuthProvider>
			<ZeroWrapper>
				<Router>
					<Route path="/" component={Home} />
					<Route path="/auth/callback" component={Callback} />
				</Router>
			</ZeroWrapper>
		</AuthProvider>
	),
	root,
);
