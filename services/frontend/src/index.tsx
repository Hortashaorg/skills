/* @refresh reload */
import { MetaProvider } from "@solidjs/meta";
import { Route, Router } from "@solidjs/router";
import { ErrorBoundary, lazy } from "solid-js";
import { render } from "solid-js/web";
import "./index.css";
import { ErrorFallback } from "./components/composite/error-fallback";
import { AppProvider } from "./context/app-provider";
import { loadConfig } from "./lib/config";

// Lazy load all routes for code splitting
const Landing = lazy(() => import("@/routes/landing"));
const Packages = lazy(() => import("@/routes/home"));
const Package = lazy(() => import("@/routes/package"));
const Ecosystems = lazy(() => import("@/routes/ecosystems"));
const Ecosystem = lazy(() => import("@/routes/ecosystem"));
const Profile = lazy(() => import("@/routes/me"));
const Notifications = lazy(() => import("@/routes/me/notifications"));
const Projects = lazy(() => import("@/routes/me/projects"));
const ProjectDetail = lazy(() => import("@/routes/me/projects/detail"));
const NewProject = lazy(() => import("@/routes/me/projects/new"));
const BrowseProjects = lazy(() => import("@/routes/projects"));
const UserProfile = lazy(() => import("@/routes/user"));
const Curation = lazy(() => import("@/routes/curation"));
const Privacy = lazy(() => import("@/routes/privacy"));
const AdminRequests = lazy(() => import("@/routes/admin/requests"));
const AdminTags = lazy(() => import("@/routes/admin/tags"));
const NotFound = lazy(() => import("@/routes/not-found"));

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
							<Route path="/user/:id" component={UserProfile} />
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
