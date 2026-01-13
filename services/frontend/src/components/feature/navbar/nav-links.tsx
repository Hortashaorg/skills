import { A } from "@solidjs/router";
import { createMemo, For, Show } from "solid-js";
import type { NavItem } from "./types";

export type NavLinksProps = {
	items: NavItem[];
	userRoles: string[];
	currentPath: string;
	layout: "horizontal" | "vertical";
	onNavigate?: () => void;
};

export const NavLinks = (props: NavLinksProps) => {
	const filteredItems = createMemo(() =>
		props.items.filter((item) => {
			if (!item.roles || item.roles.length === 0) return true;
			return item.roles.some((role) => props.userRoles.includes(role));
		}),
	);

	const isActive = (item: NavItem) => {
		if (item.exactMatch) {
			return props.currentPath === item.href;
		}
		return props.currentPath.startsWith(item.href);
	};

	const horizontal = () => props.layout === "horizontal";

	return (
		<nav class={horizontal() ? "hidden sm:flex gap-1" : "space-y-1"}>
			<For each={filteredItems()}>
				{(item) => (
					<A
						href={item.href}
						class={
							horizontal()
								? "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-all duration-200"
								: "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200"
						}
						classList={{
							"bg-brand/10 dark:bg-brand-dark/15 text-brand dark:text-brand-dark font-medium":
								isActive(item),
							"text-on-surface-muted dark:text-on-surface-dark-muted hover:bg-surface-alt dark:hover:bg-surface-dark-alt hover:text-on-surface dark:hover:text-on-surface-dark":
								!isActive(item) && horizontal(),
							"text-on-surface dark:text-on-surface-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt":
								!isActive(item) && !horizontal(),
						}}
						onClick={props.onNavigate}
					>
						<Show when={item.icon}>
							{(IconComponent) => {
								const Icon = IconComponent();
								return <Icon size="sm" />;
							}}
						</Show>
						{item.label}
					</A>
				)}
			</For>
		</nav>
	);
};
