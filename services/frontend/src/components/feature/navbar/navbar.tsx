import { A } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { BellIcon, ChevronDownIcon } from "@/components/primitives/icon";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { HoverDropdown } from "@/components/ui/hover-dropdown";
import { ConnectionStatus } from "./connection-status";
import { NavLinks } from "./nav-links";

export type NavbarNotification = {
	id: string;
	title: string;
	message: string;
	read: boolean;
};

export type NavbarProps = {
	isLoggedIn: boolean;
	isAdmin: boolean;
	currentPath: string;
	connectionState:
		| "connected"
		| "connecting"
		| "disconnected"
		| "needs-auth"
		| "error"
		| "closed";
	notifications: readonly NavbarNotification[];
	unreadCount: number;
	onLogout: () => void;
	onSignIn: () => void;
	onMarkRead: (id: string) => void;
	onMarkAllRead: () => void;
};

const UserIcon = () => (
	<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<title>Account</title>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
		/>
	</svg>
);

const MenuIcon = () => (
	<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<title>Menu</title>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M4 6h16M4 12h16M4 18h16"
		/>
	</svg>
);

const CloseIcon = () => (
	<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<title>Close</title>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M6 18L18 6M6 6l12 12"
		/>
	</svg>
);

export const Navbar = (props: NavbarProps) => {
	const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);
	const closeMobileMenu = () => setMobileMenuOpen(false);

	const isActive = (path: string) => props.currentPath.startsWith(path);
	const isExactActive = (path: string) => props.currentPath === path;

	const formatUnreadCount = () =>
		props.unreadCount >= 20 ? "20+" : props.unreadCount;

	return (
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
						<NavLinks
							currentPath={props.currentPath}
							layout="horizontal"
							onNavigate={closeMobileMenu}
						/>
					</Flex>

					{/* Right side: Status + Account (desktop) */}
					<Flex gap="md" align="center" class="hidden sm:flex">
						<ConnectionStatus state={props.connectionState} />

						{/* Notifications bell */}
						<Show when={props.isLoggedIn}>
							<HoverDropdown
								trigger={
									<A
										href="/me/notifications"
										class="relative block text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark transition"
									>
										<BellIcon size="sm" />
										<Show when={props.unreadCount > 0}>
											<span class="absolute -top-1 -right-1 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark text-xs rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
												{formatUnreadCount()}
											</span>
										</Show>
									</A>
								}
								width="lg"
							>
								<div class="flex items-center justify-between px-4 py-2 border-b border-outline dark:border-outline-dark">
									<Text size="sm" weight="medium">
										Notifications
									</Text>
									<Show when={props.unreadCount > 0}>
										<button
											type="button"
											onClick={props.onMarkAllRead}
											class="text-xs text-primary dark:text-primary-dark hover:underline"
										>
											Mark all read
										</button>
									</Show>
								</div>
								<div class="max-h-80 overflow-y-auto">
									<Show
										when={props.notifications.length > 0}
										fallback={
											<div class="px-4 py-6 text-center">
												<Text size="sm" color="muted">
													No notifications
												</Text>
											</div>
										}
									>
										<For each={props.notifications}>
											{(notification) => (
												<button
													type="button"
													onClick={() => props.onMarkRead(notification.id)}
													class="block w-full text-left px-4 py-3 hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition border-b border-outline/50 dark:border-outline-dark/50 last:border-b-0"
													classList={{
														"bg-primary/5 dark:bg-primary-dark/5":
															!notification.read,
													}}
												>
													<Text
														size="sm"
														weight={notification.read ? "normal" : "medium"}
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
							</HoverDropdown>
						</Show>

						{/* Account dropdown or Sign in */}
						<Show
							when={props.isLoggedIn}
							fallback={
								<Button variant="primary" size="sm" onClick={props.onSignIn}>
									Sign in
								</Button>
							}
						>
							<HoverDropdown
								trigger={
									<button
										type="button"
										class="text-sm hover:text-on-surface dark:hover:text-on-surface-dark transition flex items-center gap-1 text-on-surface-muted dark:text-on-surface-dark-muted"
									>
										<UserIcon />
										<ChevronDownIcon size="sm" />
									</button>
								}
								width="sm"
							>
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
								<Show when={props.isAdmin}>
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
									onClick={props.onLogout}
									class="block w-full text-left px-4 py-2 text-sm text-on-surface dark:text-on-surface-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition"
								>
									Sign out
								</button>
							</HoverDropdown>
						</Show>
					</Flex>

					{/* Mobile hamburger button */}
					<button
						type="button"
						class="sm:hidden p-2 text-on-surface dark:text-on-surface-dark"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen())}
					>
						<Show when={mobileMenuOpen()} fallback={<MenuIcon />}>
							<CloseIcon />
						</Show>
					</button>
				</Flex>

				{/* Mobile menu */}
				<Show when={mobileMenuOpen()}>
					<div class="sm:hidden border-t border-outline dark:border-outline-dark py-4 space-y-2">
						<ConnectionStatus state={props.connectionState} />

						<NavLinks
							currentPath={props.currentPath}
							layout="vertical"
							onNavigate={closeMobileMenu}
						/>

						{/* Account section */}
						<Show when={props.isLoggedIn}>
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
											<Show when={props.unreadCount > 0}>
												<span class="ml-1 text-primary dark:text-primary-dark">
													({formatUnreadCount()})
												</span>
											</Show>
										</Text>
										<Show when={props.unreadCount > 0}>
											<button
												type="button"
												onClick={props.onMarkAllRead}
												class="text-xs text-primary dark:text-primary-dark hover:underline"
											>
												Mark all read
											</button>
										</Show>
									</Flex>
									<Show
										when={props.notifications.length > 0}
										fallback={
											<Text size="sm" color="muted" class="py-2">
												No notifications
											</Text>
										}
									>
										<For each={props.notifications.slice(0, 5)}>
											{(notification) => (
												<button
													type="button"
													onClick={() => props.onMarkRead(notification.id)}
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
						<Show when={props.isAdmin}>
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
								when={props.isLoggedIn}
								fallback={
									<Button
										variant="primary"
										size="sm"
										onClick={props.onSignIn}
										class="w-full"
									>
										Sign in
									</Button>
								}
							>
								<button
									type="button"
									onClick={() => {
										props.onLogout();
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
	);
};
