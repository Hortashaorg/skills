/* @refresh reload */
import { MetaProvider } from "@solidjs/meta";
import { Route, Router } from "@solidjs/router";
import { ErrorBoundary } from "solid-js";
import { render } from "solid-js/web";
import "./index.css";
import { ErrorFallback } from "./components/composite/error-fallback";
import { AppProvider } from "./context/app-provider";
import { loadConfig } from "./lib/config";
import { AdminRequests } from "./routes/admin/requests";
import { AdminTags } from "./routes/admin/tags";
import { Curation } from "./routes/curation";
import { Ecosystem } from "./routes/ecosystem";
import { Ecosystems } from "./routes/ecosystems";
import { Packages } from "./routes/home";
import { Landing } from "./routes/landing";
import { Profile } from "./routes/me";
import { Notifications } from "./routes/me/notifications";
import { Projects } from "./routes/me/projects";
import { ProjectDetail } from "./routes/me/projects/detail";
import { NewProject } from "./routes/me/projects/new";
import { NotFound } from "./routes/not-found";
import { Package } from "./routes/package";
import { Privacy } from "./routes/privacy";
import { BrowseProjects } from "./routes/projects";

const root = document.getElementById("root");

if (!root) throw new Error("Root element not found");

loadConfig().then(() => {
	render(
		() => (
			<ErrorBoundary
				fallback={(err, reset) => <ErrorFallback error={err} reset={reset} />}
			>
				<MetaProvider>
					<AppProvider>
						<Router>
							<Route path="/" component={Landing} />
							<Route path="/packages" component={Packages} />
							<Route path="/package/:registry/:name/*tab" component={Package} />
							<Route path="/ecosystems" component={Ecosystems} />
							<Route path="/ecosystem/:slug/*tab" component={Ecosystem} />
							<Route path="/me" component={Profile} />
							<Route path="/me/notifications" component={Notifications} />
							<Route path="/me/projects" component={Projects} />
							<Route path="/me/projects/new" component={NewProject} />
							<Route path="/projects" component={BrowseProjects} />
							<Route path="/projects/:id" component={ProjectDetail} />
							<Route path="/curation" component={Curation} />
							<Route path="/privacy" component={Privacy} />
							<Route path="/admin/requests" component={AdminRequests} />
							<Route path="/admin/tags" component={AdminTags} />
							<Route path="*" component={NotFound} />
						</Router>
					</AppProvider>
				</MetaProvider>
			</ErrorBoundary>
		),
		root,
	);
});
