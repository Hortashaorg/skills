import { A } from "@solidjs/router";
import { createMemo, For } from "solid-js";
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
		<nav class={horizontal() ? "hidden sm:flex gap-4" : "space-y-2"}>
			<For each={filteredItems()}>
				{(item) => (
					<A
						href={item.href}
						class={
							horizontal()
								? "text-sm hover:text-on-surface dark:hover:text-on-surface-dark transition"
								: "block py-2 text-sm"
						}
						classList={{
							"text-brand dark:text-brand-dark font-medium": isActive(item),
							"text-on-surface-muted dark:text-on-surface-dark-muted":
								!isActive(item) && horizontal(),
							"text-on-surface dark:text-on-surface-dark":
								!isActive(item) && !horizontal(),
						}}
						onClick={props.onNavigate}
					>
						{item.label}
					</A>
				)}
			</For>
		</nav>
	);
};
