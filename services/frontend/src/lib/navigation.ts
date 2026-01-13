import type { NavItem } from "@/components/feature/navbar/types";

export const mainNavItems: NavItem[] = [
	{ href: "/packages", label: "Packages" },
	{ href: "/projects", label: "Projects", exactMatch: true },
];

export const accountNavItems: NavItem[] = [
	{ href: "/me", label: "Profile", exactMatch: true },
	{ href: "/me/projects", label: "My Projects" },
	{ href: "/curation", label: "Curate", exactMatch: true },
	{ href: "/admin/requests", label: "Admin: Requests", roles: ["admin"] },
	{ href: "/admin/tags", label: "Admin: Tags", roles: ["admin"] },
];
