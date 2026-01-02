import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { IconLinkCard } from "./icon-link-card";

const meta = {
	title: "Composite/IconLinkCard",
	component: IconLinkCard,
	tags: ["autodocs"],
} satisfies Meta<typeof IconLinkCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const FolderIcon = () => (
	<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<title>Folder</title>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
		/>
	</svg>
);

const SettingsIcon = () => (
	<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<title>Settings</title>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
		/>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
		/>
	</svg>
);

const DocumentIcon = () => (
	<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<title>Document</title>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
		/>
	</svg>
);

const defaultBase: Story = {
	args: {
		href: "/projects",
		title: "Your Projects",
		description: "View and manage your projects",
		color: "primary",
		icon: <FolderIcon />,
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const secondaryBase: Story = {
	args: {
		href: "/settings",
		title: "Account Settings",
		description: "Manage password & security",
		color: "secondary",
		icon: <SettingsIcon />,
	},
};

const secondaryThemed = createThemedStories({
	story: secondaryBase,
	testMode: "both",
});

export const SecondaryLight = secondaryThemed.Light;
export const SecondaryDark = secondaryThemed.Dark;

const infoBase: Story = {
	args: {
		href: "/privacy",
		title: "Privacy Policy",
		description: "How we handle your data",
		color: "info",
		icon: <DocumentIcon />,
	},
};

const infoThemed = createThemedStories({
	story: infoBase,
	testMode: "both",
});

export const InfoLight = infoThemed.Light;
export const InfoDark = infoThemed.Dark;

const externalBase: Story = {
	args: {
		href: "https://example.com",
		title: "External Link",
		description: "Opens in a new tab",
		color: "secondary",
		external: true,
		icon: <SettingsIcon />,
	},
};

const externalThemed = createThemedStories({
	story: externalBase,
	testMode: "both",
});

export const ExternalLinkLight = externalThemed.Light;
export const ExternalLinkDark = externalThemed.Dark;

const allColorsBase: Story = {
	render: () => (
		<div class="grid gap-4 sm:grid-cols-2">
			<IconLinkCard
				href="#"
				title="Primary"
				description="Primary color variant"
				color="primary"
				icon={<FolderIcon />}
			/>
			<IconLinkCard
				href="#"
				title="Secondary"
				description="Secondary color variant"
				color="secondary"
				icon={<SettingsIcon />}
			/>
			<IconLinkCard
				href="#"
				title="Info"
				description="Info color variant"
				color="info"
				icon={<DocumentIcon />}
			/>
			<IconLinkCard
				href="#"
				title="Success"
				description="Success color variant"
				color="success"
				icon={<FolderIcon />}
			/>
			<IconLinkCard
				href="#"
				title="Warning"
				description="Warning color variant"
				color="warning"
				icon={<SettingsIcon />}
			/>
			<IconLinkCard
				href="#"
				title="Danger"
				description="Danger color variant"
				color="danger"
				icon={<DocumentIcon />}
			/>
		</div>
	),
};

const allColorsThemed = createThemedStories({
	story: allColorsBase,
	testMode: "both",
});

export const AllColorsLight = allColorsThemed.Light;
export const AllColorsDark = allColorsThemed.Dark;
