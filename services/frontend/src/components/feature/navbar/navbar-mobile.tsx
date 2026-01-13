import { A } from "@solidjs/router";
import { createMemo, For, Show } from "solid-js";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { ConnectionStatus } from "./connection-status";
import { NavLinks } from "./nav-links";
import type { NavItem } from "./types";

export type NavbarMobileProps = {
	navItems: NavItem[];
	accountNavItems: NavItem[];
	userRoles: string[];
	currentPath: string;
	connectionState:
		| "connected"
		| "connecting"
		| "disconnected"
		| "needs-auth"
		| "error"
		| "closed";
	isLoggedIn: boolean;
	onSignIn: () => void;
	onLogout: () => void;
	onNavigate: () => void;
};

export const NavbarMobile = (props: NavbarMobileProps) => {
	const isActive = (item: NavItem) => {
		if (item.exactMatch) {
			return props.currentPath === item.href;
		}
		return props.currentPath.startsWith(item.href);
	};

	const filteredAccountItems = createMemo(() =>
		props.accountNavItems.filter((item) => {
			if (!item.roles || item.roles.length === 0) return true;
			return item.roles.some((role) => props.userRoles.includes(role));
		}),
	);

	const regularAccountItems = createMemo(() =>
		filteredAccountItems().filter(
			(item) => !item.roles || item.roles.length === 0,
		),
	);

	const adminItems = createMemo(() =>
		filteredAccountItems().filter(
			(item) => item.roles && item.roles.length > 0,
		),
	);

	return (
		<div class="sm:hidden border-t border-outline dark:border-outline-dark py-4 space-y-2">
			<ConnectionStatus state={props.connectionState} />

			<NavLinks
				items={props.navItems}
				userRoles={props.userRoles}
				currentPath={props.currentPath}
				layout="vertical"
				onNavigate={props.onNavigate}
			/>

			<Show when={props.isLoggedIn}>
				<div class="pt-2 border-t border-outline dark:border-outline-dark space-y-2">
					<Text size="xs" color="muted" class="uppercase tracking-wide">
						Account
					</Text>
					<For each={regularAccountItems()}>
						{(item) => (
							<A
								href={item.href}
								class="block py-2 text-sm"
								classList={{
									"text-brand dark:text-brand-dark font-medium": isActive(item),
									"text-on-surface dark:text-on-surface-dark": !isActive(item),
								}}
								onClick={props.onNavigate}
							>
								{item.label}
							</A>
						)}
					</For>
				</div>
			</Show>

			<Show when={adminItems().length > 0}>
				<div class="pt-2 border-t border-outline dark:border-outline-dark space-y-2">
					<Text size="xs" color="muted" class="uppercase tracking-wide">
						Admin
					</Text>
					<For each={adminItems()}>
						{(item) => (
							<A
								href={item.href}
								class="block py-2 text-sm"
								classList={{
									"text-brand dark:text-brand-dark font-medium": isActive(item),
									"text-on-surface dark:text-on-surface-dark": !isActive(item),
								}}
								onClick={props.onNavigate}
							>
								{item.label}
							</A>
						)}
					</For>
				</div>
			</Show>

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
							props.onNavigate();
						}}
						class="block w-full text-left py-2 text-sm text-on-surface dark:text-on-surface-dark"
					>
						Sign out
					</button>
				</Show>
			</div>
		</div>
	);
};
