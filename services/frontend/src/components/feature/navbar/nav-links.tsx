import { A } from "@solidjs/router";
import { For } from "solid-js";

type NavLink = {
	href: string;
	label: string;
	exactMatch?: boolean;
};

const links: NavLink[] = [
	{ href: "/packages", label: "Packages" },
	{ href: "/projects", label: "Projects", exactMatch: true },
];

export type NavLinksProps = {
	currentPath: string;
	layout: "horizontal" | "vertical";
	onNavigate?: () => void;
};

export const NavLinks = (props: NavLinksProps) => {
	const isActive = (link: NavLink) => {
		if (link.exactMatch) {
			return props.currentPath === link.href;
		}
		return props.currentPath.startsWith(link.href);
	};

	const horizontal = () => props.layout === "horizontal";

	return (
		<nav class={horizontal() ? "hidden sm:flex gap-4" : "space-y-2"}>
			<For each={links}>
				{(link) => (
					<A
						href={link.href}
						class={
							horizontal()
								? "text-sm hover:text-on-surface dark:hover:text-on-surface-dark transition"
								: "block py-2 text-sm"
						}
						classList={{
							"text-primary dark:text-primary-dark font-medium": isActive(link),
							"text-on-surface-muted dark:text-on-surface-dark-muted":
								!isActive(link) && horizontal(),
							"text-on-surface dark:text-on-surface-dark":
								!isActive(link) && !horizontal(),
						}}
						onClick={props.onNavigate}
					>
						{link.label}
					</A>
				)}
			</For>
		</nav>
	);
};
