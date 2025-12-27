/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import "./index.css";
import { AppProvider } from "./context/app-provider";
import { AdminRequests } from "./routes/admin/requests";
import { AdminTags } from "./routes/admin/tags";
import { Home } from "./routes/home";
import { NotFound } from "./routes/not-found";
import { Package } from "./routes/package";
import { VerifyEmail } from "./routes/verify-email";

const root = document.getElementById("root");

if (!root) throw new Error("Root element not found");

render(
	() => (
		<AppProvider>
			<Router>
				<Route path="/" component={Home} />
				<Route path="/package/:registry/:name" component={Package} />
				<Route path="/verify-email" component={VerifyEmail} />
				<Route path="/admin/requests" component={AdminRequests} />
				<Route path="/admin/tags" component={AdminTags} />
				<Route path="*" component={NotFound} />
			</Router>
		</AppProvider>
	),
	root,
);
