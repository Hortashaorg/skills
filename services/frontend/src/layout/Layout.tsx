import {
	mutators,
	queries,
	useConnectionState,
	useQuery,
	useZero,
} from "@package/database/client";
import { A, useLocation, useParams } from "@solidjs/router";
import {
	createMemo,
	createSignal,
	For,
	Index,
	Match,
	type ParentComponent,
	Show,
	Switch,
} from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { BellIcon } from "@/components/primitives/icon";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
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
	const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);

	const breadcrumbs = createMemo(() =>
		getBreadcrumbs(location.pathname, params),
	);

	const [notifications] = useQuery(() => queries.notifications.mine());
	const [unreadNotifications] = useQuery(() =>
		queries.notifications.unreadCount(),
	);
	const unreadCount = () => unreadNotifications()?.length ?? 0;

	const handleLogout = async () => {
		await logout();
	};

	const handleSignIn = () => {
		saveReturnUrl();
		window.location.href = getAuthorizationUrl();
	};

	const handleMarkAllRead = async () => {
		zero().mutate(mutators.notifications.markAllRead());
	};

	const handleMarkRead = async (id: string) => {
		zero().mutate(mutators.notifications.markRead({ id }));
	};

	const isAnonymous = () => zero().userID === "anon";
	const isAdmin = () => getAuthData()?.roles?.includes("admin") ?? false;
	const isActive = (path: string) => location.pathname.startsWith(path);
	const isExactActive = (path: string) => location.pathname === path;
	const closeMobileMenu = () => setMobileMenuOpen(false);

	return (
		<div class="min-h-screen bg-surface dark:bg-surface-dark">
			<header class="border-b border-outline dark:border-outline-dark">
				<Container>
					<Flex justify="between" align="center" class="h-14">
						{/* Left side: Logo + Nav links */}
						<Flex gap="md" align="center">
							<A
								href="/"
								class="hover:opacity-75 transition"
								onClick={closeMobileMenu}
							>
								<Text size="lg" weight="semibold" as="span">
									TechGarden
								</Text>
							</A>

							{/* Desktop nav links */}
							<nav class="hidden sm:flex gap-4">
								<A
									href="/packages"
									class="text-sm hover:text-on-surface dark:hover:text-on-surface-dark transition"
									classList={{
										"text-primary dark:text-primary-dark font-medium":
											isActive("/packages"),
										"text-on-surface-muted dark:text-on-surface-dark-muted":
											!isActive("/packages"),
									}}
								>
									Packages
								</A>
								<A
									href="/projects"
									class="text-sm hover:text-on-surface dark:hover:text-on-surface-dark transition"
									classList={{
										"text-primary dark:text-primary-dark font-medium":
											isExactActive("/projects"),
										"text-on-surface-muted dark:text-on-surface-dark-muted":
											!isExactActive("/projects"),
									}}
								>
									Projects
								</A>
							</nav>
						</Flex>

						{/* Right side: Status + Account */}
						<Flex gap="md" align="center" class="hidden sm:flex">
							{/* Connection status badges */}
							<Show when={connectionState().name === "connecting"}>
								<Badge variant="info" size="sm">
									Connecting...
								</Badge>
							</Show>
							<Show when={connectionState().name === "disconnected"}>
								<Badge variant="warning" size="sm">
									Offline
								</Badge>
							</Show>
							<Show when={connectionState().name === "needs-auth"}>
								<Badge variant="info" size="sm">
									Refreshing...
								</Badge>
							</Show>
							<Show when={connectionState().name === "error"}>
								<Badge variant="danger" size="sm">
									Connection Error
								</Badge>
							</Show>

							{/* Notifications bell (logged in only) */}
							<Show when={!isAnonymous()}>
								<div class="relative group">
									<A
										href="/me/notifications"
										class="relative block text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark transition"
									>
										<BellIcon size="sm" />
										<Show when={unreadCount() > 0}>
											<span class="absolute -top-1 -right-1 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark text-xs rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
												{unreadCount() >= 20 ? "20+" : unreadCount()}
											</span>
										</Show>
									</A>
									<div class="absolute -right-2 top-full hidden group-hover:block z-50 p-2">
										<div class="bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-md shadow-lg w-80">
											<div class="flex items-center justify-between px-4 py-2 border-b border-outline dark:border-outline-dark">
												<Text size="sm" weight="medium">
													Notifications
												</Text>
												<Show when={unreadCount() > 0}>
													<button
														type="button"
														onClick={handleMarkAllRead}
														class="text-xs text-primary dark:text-primary-dark hover:underline"
													>
														Mark all read
													</button>
												</Show>
											</div>
											<div class="max-h-80 overflow-y-auto">
												<Show
													when={(notifications()?.length ?? 0) > 0}
													fallback={
														<div class="px-4 py-6 text-center">
															<Text size="sm" color="muted">
																No notifications
															</Text>
														</div>
													}
												>
													<For each={notifications()}>
														{(notification) => (
															<button
																type="button"
																onClick={() => handleMarkRead(notification.id)}
																class="block w-full text-left px-4 py-3 hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition border-b border-outline/50 dark:border-outline-dark/50 last:border-b-0"
																classList={{
																	"bg-primary/5 dark:bg-primary-dark/5":
																		!notification.read,
																}}
															>
																<Text
																	size="sm"
																	weight={
																		notification.read ? "normal" : "medium"
																	}
																>
																	{notification.title}
																</Text>
																<Text size="xs" color="muted" class="mt-0.5">
																	{notification.message}
																</Text>
															</button>
														)}
													</For>
												</Show>
											</div>
										</div>
									</div>
								</div>
							</Show>

							{/* Account dropdown or Sign in */}
							<Show
								when={!isAnonymous()}
								fallback={
									<Button variant="primary" size="sm" onClick={handleSignIn}>
										Sign in
									</Button>
								}
							>
								<div class="relative group">
									<button
										type="button"
										class="text-sm hover:text-on-surface dark:hover:text-on-surface-dark transition flex items-center gap-1 text-on-surface-muted dark:text-on-surface-dark-muted"
									>
										<svg
											class="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>Account</title>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
											/>
										</svg>
										<svg
											class="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>Expand</title>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</button>
									<div class="absolute -right-2 top-full hidden group-hover:block z-50 p-2">
										<div class="bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-md shadow-lg min-w-44">
											<A
												href="/me"
												class="block px-4 py-2 text-sm hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition"
												classList={{
													"text-primary dark:text-primary-dark font-medium":
														isExactActive("/me"),
													"text-on-surface dark:text-on-surface-dark":
														!isExactActive("/me"),
												}}
											>
												Profile
											</A>
											<A
												href="/me/projects"
												class="block px-4 py-2 text-sm hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition"
												classList={{
													"text-primary dark:text-primary-dark font-medium":
														isActive("/me/projects"),
													"text-on-surface dark:text-on-surface-dark":
														!isActive("/me/projects"),
												}}
											>
												My Projects
											</A>
											<A
												href="/curation"
												class="block px-4 py-2 text-sm hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition"
												classList={{
													"text-primary dark:text-primary-dark font-medium":
														isExactActive("/curation"),
													"text-on-surface dark:text-on-surface-dark":
														!isExactActive("/curation"),
												}}
											>
												Curate
											</A>
											<Show when={isAdmin()}>
												<div class="border-t border-outline dark:border-outline-dark my-1" />
												<A
													href="/admin/requests"
													class="block px-4 py-2 text-sm hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition"
													classList={{
														"text-primary dark:text-primary-dark font-medium":
															isActive("/admin/requests"),
														"text-on-surface dark:text-on-surface-dark":
															!isActive("/admin/requests"),
													}}
												>
													Admin: Requests
												</A>
												<A
													href="/admin/tags"
													class="block px-4 py-2 text-sm hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition"
													classList={{
														"text-primary dark:text-primary-dark font-medium":
															isActive("/admin/tags"),
														"text-on-surface dark:text-on-surface-dark":
															!isActive("/admin/tags"),
													}}
												>
													Admin: Tags
												</A>
											</Show>
											<div class="border-t border-outline dark:border-outline-dark my-1" />
											<button
												type="button"
												onClick={handleLogout}
												class="block w-full text-left px-4 py-2 text-sm text-on-surface dark:text-on-surface-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition"
											>
												Sign out
											</button>
										</div>
									</div>
								</div>
							</Show>
						</Flex>

						{/* Mobile hamburger button */}
						<button
							type="button"
							class="sm:hidden p-2 text-on-surface dark:text-on-surface-dark"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen())}
						>
							<svg
								class="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Menu</title>
								<Show
									when={mobileMenuOpen()}
									fallback={
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M4 6h16M4 12h16M4 18h16"
										/>
									}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</Show>
							</svg>
						</button>
					</Flex>

					{/* Mobile menu */}
					<Show when={mobileMenuOpen()}>
						<div class="sm:hidden border-t border-outline dark:border-outline-dark py-4 space-y-2">
							{/* Connection status */}
							<Show when={connectionState().name === "connecting"}>
								<Badge variant="info" size="sm">
									Connecting...
								</Badge>
							</Show>
							<Show when={connectionState().name === "disconnected"}>
								<Badge variant="warning" size="sm">
									Offline
								</Badge>
							</Show>
							<Show when={connectionState().name === "error"}>
								<Badge variant="danger" size="sm">
									Connection Error
								</Badge>
							</Show>

							{/* Browse links */}
							<A
								href="/packages"
								class="block py-2 text-sm"
								classList={{
									"text-primary dark:text-primary-dark font-medium":
										isActive("/packages"),
									"text-on-surface dark:text-on-surface-dark":
										!isActive("/packages"),
								}}
								onClick={closeMobileMenu}
							>
								Packages
							</A>
							<A
								href="/projects"
								class="block py-2 text-sm"
								classList={{
									"text-primary dark:text-primary-dark font-medium":
										isExactActive("/projects"),
									"text-on-surface dark:text-on-surface-dark":
										!isExactActive("/projects"),
								}}
								onClick={closeMobileMenu}
							>
								Projects
							</A>

							{/* Account section */}
							<Show when={!isAnonymous()}>
								<div class="pt-2 border-t border-outline dark:border-outline-dark space-y-2">
									<Text size="xs" color="muted" class="uppercase tracking-wide">
										Account
									</Text>
									<A
										href="/me"
										class="block py-2 text-sm"
										classList={{
											"text-primary dark:text-primary-dark font-medium":
												isExactActive("/me"),
											"text-on-surface dark:text-on-surface-dark":
												!isExactActive("/me"),
										}}
										onClick={closeMobileMenu}
									>
										Profile
									</A>
									<A
										href="/me/projects"
										class="block py-2 text-sm"
										classList={{
											"text-primary dark:text-primary-dark font-medium":
												isActive("/me/projects"),
											"text-on-surface dark:text-on-surface-dark":
												!isActive("/me/projects"),
										}}
										onClick={closeMobileMenu}
									>
										My Projects
									</A>
									<A
										href="/curation"
										class="block py-2 text-sm"
										classList={{
											"text-primary dark:text-primary-dark font-medium":
												isExactActive("/curation"),
											"text-on-surface dark:text-on-surface-dark":
												!isExactActive("/curation"),
										}}
										onClick={closeMobileMenu}
									>
										Curate
									</A>

									{/* Notifications in mobile */}
									<div class="pt-2 border-t border-outline dark:border-outline-dark space-y-2">
										<Flex justify="between" align="center">
											<Text
												size="xs"
												color="muted"
												class="uppercase tracking-wide"
											>
												Notifications
												<Show when={unreadCount() > 0}>
													<span class="ml-1 text-primary dark:text-primary-dark">
														({unreadCount() >= 20 ? "20+" : unreadCount()})
													</span>
												</Show>
											</Text>
											<Show when={unreadCount() > 0}>
												<button
													type="button"
													onClick={handleMarkAllRead}
													class="text-xs text-primary dark:text-primary-dark hover:underline"
												>
													Mark all read
												</button>
											</Show>
										</Flex>
										<Show
											when={(notifications()?.length ?? 0) > 0}
											fallback={
												<Text size="sm" color="muted" class="py-2">
													No notifications
												</Text>
											}
										>
											<For each={notifications()?.slice(0, 5)}>
												{(notification) => (
													<button
														type="button"
														onClick={() => handleMarkRead(notification.id)}
														class="block w-full text-left py-2"
														classList={{
															"text-on-surface dark:text-on-surface-dark":
																!notification.read,
															"text-on-surface-muted dark:text-on-surface-dark-muted":
																notification.read,
														}}
													>
														<Text
															size="sm"
															weight={notification.read ? "normal" : "medium"}
														>
															{notification.title}
														</Text>
													</button>
												)}
											</For>
											<A
												href="/me/notifications"
												class="block py-2 text-sm text-primary dark:text-primary-dark"
												onClick={closeMobileMenu}
											>
												View all notifications
											</A>
										</Show>
									</div>
								</div>
							</Show>

							{/* Admin links */}
							<Show when={isAdmin()}>
								<div class="pt-2 border-t border-outline dark:border-outline-dark space-y-2">
									<Text size="xs" color="muted" class="uppercase tracking-wide">
										Admin
									</Text>
									<A
										href="/admin/requests"
										class="block py-2 text-sm"
										classList={{
											"text-primary dark:text-primary-dark font-medium":
												isActive("/admin/requests"),
											"text-on-surface dark:text-on-surface-dark":
												!isActive("/admin/requests"),
										}}
										onClick={closeMobileMenu}
									>
										Package Requests
									</A>
									<A
										href="/admin/tags"
										class="block py-2 text-sm"
										classList={{
											"text-primary dark:text-primary-dark font-medium":
												isActive("/admin/tags"),
											"text-on-surface dark:text-on-surface-dark":
												!isActive("/admin/tags"),
										}}
										onClick={closeMobileMenu}
									>
										Tags
									</A>
								</div>
							</Show>

							{/* Auth actions */}
							<div class="pt-2 border-t border-outline dark:border-outline-dark">
								<Show
									when={!isAnonymous()}
									fallback={
										<Button
											variant="primary"
											size="sm"
											onClick={handleSignIn}
											class="w-full"
										>
											Sign in
										</Button>
									}
								>
									<button
										type="button"
										onClick={() => {
											handleLogout();
											closeMobileMenu();
										}}
										class="block w-full text-left py-2 text-sm text-on-surface dark:text-on-surface-dark"
									>
										Sign out
									</button>
								</Show>
							</div>
						</div>
					</Show>
				</Container>
			</header>
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
