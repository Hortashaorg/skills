import { A } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import {
	BellIcon,
	ChevronDownIcon,
	MoonIcon,
	SunIcon,
} from "@/components/primitives/icon";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { useDarkMode } from "@/hooks/useDarkMode";
import { ConnectionStatus } from "./connection-status";
import { NavLinks } from "./nav-links";

const iconButtonClass =
	"p-2 rounded-full text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition cursor-pointer";

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
	const { isDark, toggle: toggleDarkMode } = useDarkMode();
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
							<span class="text-lg font-semibold text-on-surface dark:text-on-surface-dark inline-flex items-center gap-1.5">
								<svg class="w-5 h-5" viewBox="0 0 32 32" fill="none">
									<title>TechGarden</title>
									<path
										d="M16 28 C16 28 16 18 16 14"
										stroke="currentColor"
										stroke-width="2.5"
										stroke-linecap="round"
										class="text-brand dark:text-brand-dark"
									/>
									<path
										d="M16 18 C12 16 8 12 10 6 C14 8 16 12 16 18"
										fill="currentColor"
										class="text-brand dark:text-brand-dark"
									/>
									<path
										d="M16 14 C20 12 24 10 26 4 C22 6 18 10 16 14"
										fill="currentColor"
										class="text-success dark:text-success-dark"
									/>
								</svg>
								Tech<span class="text-brand dark:text-brand-dark">Garden</span>
							</span>
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

						{/* Dark mode toggle */}
						<button
							type="button"
							aria-label={
								isDark() ? "Switch to light mode" : "Switch to dark mode"
							}
							class={iconButtonClass}
							onClick={toggleDarkMode}
						>
							<Show when={isDark()} fallback={<MoonIcon size="sm" />}>
								<SunIcon size="sm" />
							</Show>
						</button>

						{/* Notifications bell */}
						<Show when={props.isLoggedIn}>
							<Dropdown>
								<Dropdown.Trigger
									aria-label="Notifications"
									class={`relative ${iconButtonClass}`}
								>
									<BellIcon size="sm" />
									<Show when={props.unreadCount > 0}>
										<span class="absolute top-0 right-0 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark text-xs rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
											{formatUnreadCount()}
										</span>
									</Show>
								</Dropdown.Trigger>
								<Dropdown.Content width="lg">
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
													<Dropdown.Item
														onSelect={() => props.onMarkRead(notification.id)}
														class={
															!notification.read
																? "bg-primary/5 dark:bg-primary-dark/5"
																: ""
														}
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
													</Dropdown.Item>
												)}
											</For>
										</Show>
									</div>
									<Dropdown.LinkItem
										href="/me/notifications"
										class="text-center text-primary dark:text-primary-dark border-t border-outline dark:border-outline-dark"
									>
										View all notifications
									</Dropdown.LinkItem>
								</Dropdown.Content>
							</Dropdown>
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
							<Dropdown>
								<Dropdown.Trigger
									aria-label="Account menu"
									class={`flex items-center gap-0.5 ${iconButtonClass}`}
								>
									<UserIcon />
									<ChevronDownIcon size="xs" />
								</Dropdown.Trigger>
								<Dropdown.Content width="sm">
									<Dropdown.LinkItem href="/me" active={isExactActive("/me")}>
										Profile
									</Dropdown.LinkItem>
									<Dropdown.LinkItem
										href="/me/projects"
										active={isActive("/me/projects")}
									>
										My Projects
									</Dropdown.LinkItem>
									<Dropdown.LinkItem
										href="/curation"
										active={isExactActive("/curation")}
									>
										Curate
									</Dropdown.LinkItem>
									<Show when={props.isAdmin}>
										<Dropdown.Separator />
										<Dropdown.LinkItem
											href="/admin/requests"
											active={isActive("/admin/requests")}
										>
											Admin: Requests
										</Dropdown.LinkItem>
										<Dropdown.LinkItem
											href="/admin/tags"
											active={isActive("/admin/tags")}
										>
											Admin: Tags
										</Dropdown.LinkItem>
									</Show>
									<Dropdown.Separator />
									<Dropdown.Item onSelect={props.onLogout}>
										Sign out
									</Dropdown.Item>
								</Dropdown.Content>
							</Dropdown>
						</Show>
					</Flex>

					{/* Mobile: dark mode + bell + hamburger */}
					<Flex gap="xs" align="center" class="sm:hidden">
						{/* Dark mode toggle */}
						<button
							type="button"
							aria-label={
								isDark() ? "Switch to light mode" : "Switch to dark mode"
							}
							class={iconButtonClass}
							onClick={toggleDarkMode}
						>
							<Show when={isDark()} fallback={<MoonIcon size="sm" />}>
								<SunIcon size="sm" />
							</Show>
						</button>

						<Show when={props.isLoggedIn}>
							<A
								href="/me/notifications"
								aria-label="Notifications"
								class={`relative ${iconButtonClass}`}
							>
								<BellIcon size="sm" />
								<Show when={props.unreadCount > 0}>
									<span class="absolute top-0 right-0 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark text-xs rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
										{formatUnreadCount()}
									</span>
								</Show>
							</A>
						</Show>
						<button
							type="button"
							aria-label={mobileMenuOpen() ? "Close menu" : "Open menu"}
							aria-expanded={mobileMenuOpen()}
							class={iconButtonClass}
							onClick={() => setMobileMenuOpen(!mobileMenuOpen())}
						>
							<Show when={mobileMenuOpen()} fallback={<MenuIcon />}>
								<CloseIcon />
							</Show>
						</button>
					</Flex>
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
										"text-brand dark:text-brand-dark font-medium":
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
										"text-brand dark:text-brand-dark font-medium":
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
										"text-brand dark:text-brand-dark font-medium":
											isExactActive("/curation"),
										"text-on-surface dark:text-on-surface-dark":
											!isExactActive("/curation"),
									}}
									onClick={closeMobileMenu}
								>
									Curate
								</A>
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
										"text-brand dark:text-brand-dark font-medium":
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
										"text-brand dark:text-brand-dark font-medium":
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
