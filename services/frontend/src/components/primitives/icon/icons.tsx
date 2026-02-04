import { splitProps } from "solid-js";
import { Icon, type IconProps } from "./icon";

type IconComponentProps = Omit<IconProps, "children">;

export const SearchIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Search"} {...others}>
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.35-4.35" />
		</Icon>
	);
};

export const SpinnerIcon = (
	props: IconComponentProps & { animated?: boolean },
) => {
	const [local, others] = splitProps(props, ["title", "animated", "class"]);
	return (
		<Icon
			title={local.title ?? "Loading"}
			class={
				local.animated !== false
					? `animate-spin ${local.class ?? ""}`
					: local.class
			}
			{...others}
		>
			<path d="M21 12a9 9 0 1 1-6.219-8.56" />
		</Icon>
	);
};

export const XCircleIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Clear"} {...others}>
			<circle cx="12" cy="12" r="10" />
			<path d="m15 9-6 6" />
			<path d="m9 9 6 6" />
		</Icon>
	);
};

export const XIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Close"} {...others}>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</Icon>
	);
};

export const CheckIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Check"} {...others}>
			<polyline points="20 6 9 17 4 12" />
		</Icon>
	);
};

export const ChevronDownIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Expand"} {...others}>
			<path d="m6 9 6 6 6-6" />
		</Icon>
	);
};

export const ChevronUpIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Collapse"} {...others}>
			<path d="m18 15-6-6-6 6" />
		</Icon>
	);
};

export const ChevronRightIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Next"} {...others}>
			<path d="m9 18 6-6-6-6" />
		</Icon>
	);
};

export const PencilIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Edit"} {...others}>
			<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
			<path d="m15 5 4 4" />
		</Icon>
	);
};

export const PlusIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Add"} {...others}>
			<path d="M12 5v14" />
			<path d="M5 12h14" />
		</Icon>
	);
};

export const FolderIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Folder"} {...others}>
			<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
		</Icon>
	);
};

export const SettingsIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Settings"} {...others}>
			<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
			<circle cx="12" cy="12" r="3" />
		</Icon>
	);
};

export const DocumentIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Document"} {...others}>
			<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
			<path d="M14 2v4a2 2 0 0 0 2 2h4" />
			<path d="M10 9H8" />
			<path d="M16 13H8" />
			<path d="M16 17H8" />
		</Icon>
	);
};

export const ExternalLinkIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "External link"} {...others}>
			<path d="M15 3h6v6" />
			<path d="M10 14 21 3" />
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
		</Icon>
	);
};

export const TrashIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Delete"} {...others}>
			<path d="M3 6h18" />
			<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
			<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
		</Icon>
	);
};

export const PackageIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Package"} {...others}>
			<path d="M16.5 9.4 7.55 4.24" />
			<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
			<polyline points="3.29 7 12 12 20.71 7" />
			<line x1="12" x2="12" y1="22" y2="12" />
		</Icon>
	);
};

export const UsersIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Users"} {...others}>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</Icon>
	);
};

export const BellIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Notifications"} {...others}>
			<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
			<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
		</Icon>
	);
};

export const SunIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Light mode"} {...others}>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2" />
			<path d="M12 20v2" />
			<path d="m4.93 4.93 1.41 1.41" />
			<path d="m17.66 17.66 1.41 1.41" />
			<path d="M2 12h2" />
			<path d="M20 12h2" />
			<path d="m6.34 17.66-1.41 1.41" />
			<path d="m19.07 4.93-1.41 1.41" />
		</Icon>
	);
};

export const MoonIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Dark mode"} {...others}>
			<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
		</Icon>
	);
};

export const TrophyIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Trophy"} {...others}>
			<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
			<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
			<path d="M4 22h16" />
			<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
			<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
			<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
		</Icon>
	);
};

export const UserIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Account"} {...others}>
			<circle cx="12" cy="8" r="5" />
			<path d="M20 21a8 8 0 0 0-16 0" />
		</Icon>
	);
};

export const MenuIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Menu"} {...others}>
			<path d="M4 6h16" />
			<path d="M4 12h16" />
			<path d="M4 18h16" />
		</Icon>
	);
};

export const ArrowUpIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Arrow up"} {...others}>
			<path d="m5 12 7-7 7 7" />
			<path d="M12 19V5" />
		</Icon>
	);
};

export const GlobeIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Globe"} {...others}>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
			<path d="M2 12h20" />
		</Icon>
	);
};

export const ChecklistIcon = (props: IconComponentProps) => {
	const [local, others] = splitProps(props, ["title"]);
	return (
		<Icon title={local.title ?? "Checklist"} {...others}>
			<rect x="3" y="5" width="6" height="6" rx="1" />
			<path d="m3 17 2 2 4-4" />
			<path d="M13 6h8" />
			<path d="M13 12h8" />
			<path d="M13 18h8" />
		</Icon>
	);
};

export type { IconComponentProps };
