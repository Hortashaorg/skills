import type { NavItem } from "@/components/feature/navbar/types";
import {
	FolderIcon,
	GlobeIcon,
	PackageIcon,
} from "@/components/primitives/icon";

export const mainNavItems: NavItem[] = [
	{ href: "/packages", label: "Packages", icon: PackageIcon },
	{ href: "/ecosystems", label: "Ecosystems", icon: GlobeIcon },
	{ href: "/projects", label: "Projects", exactMatch: true, icon: FolderIcon },
];

export const accountNavItems: NavItem[] = [
	{ href: "/me", label: "Profile", exactMatch: true },
	{ href: "/me/projects", label: "My Projects" },
	{ href: "/curation", label: "Curate", exactMatch: true },
	{ href: "/admin/requests", label: "Admin: Requests", roles: ["admin"] },
	{ href: "/admin/tags", label: "Admin: Tags", roles: ["admin"] },
];
