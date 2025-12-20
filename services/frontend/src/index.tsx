/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import "./index.css";
import { AppProvider } from "./context/app-provider";
import { Home } from "./routes/home";
import { Package } from "./routes/package";

const root = document.getElementById("root");

if (!root) throw new Error("Root element not found");

render(
	() => (
		<AppProvider>
			<Router>
				<Route path="/" component={Home} />
				<Route path="/package/:registry/:name" component={Package} />
			</Router>
		</AppProvider>
	),
	root,
);
