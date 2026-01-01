import {
	queries,
	useConnectionState,
	useQuery,
	useZero,
} from "@package/database/client";
import { A, useLocation, useParams } from "@solidjs/router";
import {
	createMemo,
	createSignal,
	Index,
	Match,
	type ParentComponent,
	Show,
	Switch,
} from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
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

	const handleLogout = async () => {
		await logout();
	};

	const handleSignIn = () => {
		saveReturnUrl();
		window.location.href = getAuthorizationUrl();
	};

	const isAnonymous = () => zero().userID === "anon";
	const isAdmin = () => getAuthData()?.roles?.includes("admin") ?? false;
	const isActive = (path: string) => location.pathname.startsWith(path);
	const displayUserId = () => {
		const id = zero().userID;
		if (id === "anon") return null;
		return id.length > 8 ? `${id.slice(0, 8)}...` : id;
	};

	const closeMobileMenu = () => setMobileMenuOpen(false);

	return (
		<div class="min-h-screen bg-surface dark:bg-surface-dark">
			<header class="border-b border-outline dark:border-outline-dark">
				<Container>
					<Flex justify="between" align="center" class="h-14">
						<A
							href="/"
							class="hover:opacity-75 transition"
							onClick={closeMobileMenu}
						>
							<Text size="lg" weight="semibold" as="span">
								TechGarden
							</Text>
						</A>

						{/* Desktop navigation */}
						<Flex gap="md" align="center" class="hidden sm:flex">
							<Show when={!isAnonymous()}>
								<A
									href="/projects"
									class="text-sm hover:text-on-surface dark:hover:text-on-surface-dark transition"
									classList={{
										"text-primary dark:text-primary-dark font-medium":
											isActive("/projects"),
										"text-on-surface-muted dark:text-on-surface-dark-muted":
											!isActive("/projects"),
									}}
								>
									Projects
								</A>
							</Show>
							<Show when={isAdmin()}>
								<div class="relative group">
									<button
										type="button"
										class="text-sm hover:text-on-surface dark:hover:text-on-surface-dark transition flex items-center gap-1"
										classList={{
											"text-primary dark:text-primary-dark font-medium":
												isActive("/admin"),
											"text-on-surface-muted dark:text-on-surface-dark-muted":
												!isActive("/admin"),
										}}
									>
										Admin
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
									<div class="absolute right-0 top-full pt-1 hidden group-hover:block z-50">
										<div class="bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-md shadow-lg min-w-40">
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
												Package Requests
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
												Tags
											</A>
										</div>
									</div>
								</div>
							</Show>
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

							{/* User info and auth actions */}
							<Show
								when={!isAnonymous()}
								fallback={
									<Button variant="primary" size="sm" onClick={handleSignIn}>
										Sign in
									</Button>
								}
							>
								<Text size="sm" color="muted">
									{displayUserId()}
								</Text>
								<Button variant="outline" size="sm" onClick={handleLogout}>
									Logout
								</Button>
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
						<div class="sm:hidden border-t border-outline dark:border-outline-dark py-4 space-y-4">
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

							{/* Projects link */}
							<Show when={!isAnonymous()}>
								<A
									href="/projects"
									class="block py-2 text-sm"
									classList={{
										"text-primary dark:text-primary-dark font-medium":
											isActive("/projects"),
										"text-on-surface dark:text-on-surface-dark":
											!isActive("/projects"),
									}}
									onClick={closeMobileMenu}
								>
									Projects
								</A>
							</Show>

							{/* Admin links */}
							<Show when={isAdmin()}>
								<div class="space-y-2">
									<Text size="sm" color="muted" class="font-medium">
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
									<Flex justify="between" align="center">
										<Text size="sm" color="muted">
											{displayUserId()}
										</Text>
										<Button variant="outline" size="sm" onClick={handleLogout}>
											Logout
										</Button>
									</Flex>
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
