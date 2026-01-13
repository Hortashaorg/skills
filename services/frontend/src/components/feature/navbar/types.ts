import type { Component } from "solid-js";
import type { IconProps } from "@/components/primitives/icon";

export type NavItem = {
	href: string;
	label: string;
	icon?: Component<IconProps>;
	exactMatch?: boolean;
	roles?: string[];
};

export type NavbarNotification = {
	id: string;
	title: string;
	message: string;
	read: boolean;
};
