/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { ErrorBoundary } from "solid-js";
import { render } from "solid-js/web";
import "./index.css";
import { ErrorFallback } from "./components/composite/error-fallback";
import { AppProvider } from "./context/app-provider";
import { loadConfig } from "./lib/config";
import { AdminRequests } from "./routes/admin/requests";
import { AdminTags } from "./routes/admin/tags";
import { Home } from "./routes/home";
import { Profile } from "./routes/me";
import { Projects } from "./routes/me/projects";
import { ProjectDetail } from "./routes/me/projects/detail";
import { NewProject } from "./routes/me/projects/new";
import { NotFound } from "./routes/not-found";
import { Package } from "./routes/package";
import { VerifyEmail } from "./routes/verify-email";

const root = document.getElementById("root");

if (!root) throw new Error("Root element not found");

loadConfig().then(() => {
	render(
		() => (
			<ErrorBoundary
				fallback={(err, reset) => <ErrorFallback error={err} reset={reset} />}
			>
				<AppProvider>
					<Router>
						<Route path="/" component={Home} />
						<Route path="/package/:registry/:name" component={Package} />
						<Route path="/me" component={Profile} />
						<Route path="/me/projects" component={Projects} />
						<Route path="/me/projects/new" component={NewProject} />
						<Route path="/projects/:id" component={ProjectDetail} />
						<Route path="/verify-email" component={VerifyEmail} />
						<Route path="/admin/requests" component={AdminRequests} />
						<Route path="/admin/tags" component={AdminTags} />
						<Route path="*" component={NotFound} />
					</Router>
				</AppProvider>
			</ErrorBoundary>
		),
		root,
	);
});
