import { A } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import {
	BellIcon,
	MenuIcon,
	MoonIcon,
	SunIcon,
	XIcon,
} from "@/components/primitives/icon";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/useDarkMode";
import { AccountDropdown } from "./account-dropdown";
import { ConnectionStatus } from "./connection-status";
import { NavLinks } from "./nav-links";
import { NavbarLogo } from "./navbar-logo";
import { NavbarMobile } from "./navbar-mobile";
import { NotificationDropdown } from "./notification-dropdown";
import type { NavbarNotification, NavItem } from "./types";

const iconButtonClass =
	"p-2 rounded-full text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition cursor-pointer";

export type NavbarProps = {
	navItems: NavItem[];
	accountNavItems: NavItem[];
	userRoles: string[];
	isLoggedIn: boolean;
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

export const Navbar = (props: NavbarProps) => {
	const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);
	const { isDark, toggle: toggleDarkMode } = useDarkMode();
	const closeMobileMenu = () => setMobileMenuOpen(false);

	const formatUnreadCount = () =>
		props.unreadCount >= 20 ? "20+" : props.unreadCount;

	return (
		<header class="border-b border-outline dark:border-outline-dark">
			<Container>
				<Flex justify="between" align="center" class="h-14">
					{/* Left side: Logo + Nav links */}
					<Flex gap="md" align="center">
						<NavbarLogo onNavigate={closeMobileMenu} />
						<NavLinks
							items={props.navItems}
							userRoles={props.userRoles}
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

						{/* Notifications */}
						<Show when={props.isLoggedIn}>
							<NotificationDropdown
								notifications={props.notifications}
								unreadCount={props.unreadCount}
								onMarkRead={props.onMarkRead}
								onMarkAllRead={props.onMarkAllRead}
							/>
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
							<AccountDropdown
								navItems={props.accountNavItems}
								userRoles={props.userRoles}
								currentPath={props.currentPath}
								onLogout={props.onLogout}
							/>
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
							<Show when={mobileMenuOpen()} fallback={<MenuIcon size="lg" />}>
								<XIcon size="lg" />
							</Show>
						</button>
					</Flex>
				</Flex>

				{/* Mobile menu */}
				<Show when={mobileMenuOpen()}>
					<NavbarMobile
						navItems={props.navItems}
						accountNavItems={props.accountNavItems}
						userRoles={props.userRoles}
						currentPath={props.currentPath}
						connectionState={props.connectionState}
						isLoggedIn={props.isLoggedIn}
						onSignIn={props.onSignIn}
						onLogout={props.onLogout}
						onNavigate={closeMobileMenu}
					/>
				</Show>
			</Container>
		</header>
	);
};
