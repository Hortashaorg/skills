import type { Component } from "solid-js";
import type { IconProps } from "@/components/primitives/icon";

export type NavItemIconProps = Omit<IconProps, "children">;

export type NavItem = {
	href: string;
	label: string;
	icon?: Component<NavItemIconProps>;
	exactMatch?: boolean;
	roles?: string[];
};

export type NavbarNotification = {
	id: string;
	title: string;
	message: string;
	read: boolean;
};
