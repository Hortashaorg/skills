import {
	mutators,
	queries,
	useConnectionState,
	useQuery,
	useZero,
} from "@package/database/client";
import { useLocation, useParams } from "@solidjs/router";
import {
	createMemo,
	Index,
	Match,
	type ParentComponent,
	Show,
	Switch,
} from "solid-js";
import { Navbar } from "@/components/feature/navbar";
import { Container } from "@/components/primitives/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Toast } from "@/components/ui/toast";
import { getAuthData, logout } from "@/context/app-provider";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";
import {
	type BreadcrumbSegmentResult,
	getBreadcrumbs,
} from "@/lib/breadcrumbs";

/**
 * Breadcrumb item that resolves tag name from Zero query.
 */
const TagBreadcrumbItem = (props: {
	crumb: BreadcrumbSegmentResult;
	id: string;
}) => {
	const [tag] = useQuery(() => queries.tags.byId({ id: props.id }));

	return (
		<Breadcrumbs.Link href={props.crumb.href} current={props.crumb.current}>
			{tag()?.name ?? props.crumb.label}
		</Breadcrumbs.Link>
	);
};

/**
 * Breadcrumb item that resolves package name from Zero query.
 */
const PackageBreadcrumbItem = (props: {
	crumb: BreadcrumbSegmentResult;
	id: string;
}) => {
	const [pkg] = useQuery(() => queries.packages.byId({ id: props.id }));

	return (
		<Breadcrumbs.Link href={props.crumb.href} current={props.crumb.current}>
			{pkg()?.[0]?.name ?? props.crumb.label}
		</Breadcrumbs.Link>
	);
};

/**
 * Breadcrumb item that resolves project name from Zero query.
 */
const ProjectBreadcrumbItem = (props: {
	crumb: BreadcrumbSegmentResult;
	id: string;
}) => {
	const [project] = useQuery(() => queries.projects.byId({ id: props.id }));

	return (
		<Breadcrumbs.Link href={props.crumb.href} current={props.crumb.current}>
			{project()?.name ?? props.crumb.label}
		</Breadcrumbs.Link>
	);
};

/**
 * Breadcrumb item - delegates to resolver-specific component if specified.
 */
const BreadcrumbItem = (props: { crumb: BreadcrumbSegmentResult }) => {
	return (
		<Switch
			fallback={
				<Breadcrumbs.Link href={props.crumb.href} current={props.crumb.current}>
					{props.crumb.label}
				</Breadcrumbs.Link>
			}
		>
			<Match when={props.crumb.resolve?.type === "tag"}>
				<TagBreadcrumbItem crumb={props.crumb} id={props.crumb.label} />
			</Match>
			<Match when={props.crumb.resolve?.type === "package"}>
				<PackageBreadcrumbItem crumb={props.crumb} id={props.crumb.label} />
			</Match>
			<Match when={props.crumb.resolve?.type === "project"}>
				<ProjectBreadcrumbItem crumb={props.crumb} id={props.crumb.label} />
			</Match>
		</Switch>
	);
};

export const Layout: ParentComponent = (props) => {
	const { children } = props;
	const zero = useZero();
	const connectionState = useConnectionState();
	const location = useLocation();
	const params = useParams();

	const breadcrumbs = createMemo(() =>
		getBreadcrumbs(location.pathname, params),
	);

	const [notifications] = useQuery(() => queries.notifications.mine());
	const [unreadNotifications] = useQuery(() =>
		queries.notifications.unreadCount(),
	);

	const unreadCount = () => unreadNotifications()?.length ?? 0;
	const isAnonymous = () => zero().userID === "anon";
	const isAdmin = () => getAuthData()?.roles?.includes("admin") ?? false;

	const handleLogout = async () => {
		await logout();
	};

	const handleSignIn = () => {
		saveReturnUrl();
		window.location.href = getAuthorizationUrl();
	};

	const handleMarkAllRead = () => {
		zero().mutate(mutators.notifications.markAllRead());
	};

	const handleMarkRead = (id: string) => {
		zero().mutate(mutators.notifications.markRead({ id }));
	};

	return (
		<div class="min-h-screen bg-surface dark:bg-surface-dark">
			<Navbar
				isLoggedIn={!isAnonymous()}
				isAdmin={isAdmin()}
				currentPath={location.pathname}
				connectionState={connectionState().name}
				notifications={notifications() ?? []}
				unreadCount={unreadCount()}
				onLogout={handleLogout}
				onSignIn={handleSignIn}
				onMarkRead={handleMarkRead}
				onMarkAllRead={handleMarkAllRead}
			/>
			<Show when={breadcrumbs()}>
				{(crumbs) => (
					<div class="border-b border-outline dark:border-outline-dark bg-surface-alt/50 dark:bg-surface-dark-alt/50">
						<Container>
							<div class="py-3">
								<Breadcrumbs.Root>
									<Index each={crumbs()}>
										{(crumb, index) => (
											<>
												<Show when={index > 0}>
													<Breadcrumbs.Separator />
												</Show>
												<BreadcrumbItem crumb={crumb()} />
											</>
										)}
									</Index>
								</Breadcrumbs.Root>
							</div>
						</Container>
					</div>
				)}
			</Show>
			<main class="py-8">{children}</main>
			<Toast.Region />
		</div>
	);
};
