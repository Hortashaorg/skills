import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Icon } from "./icon";
import {
	CheckIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	ChevronUpIcon,
	DocumentIcon,
	ExternalLinkIcon,
	FolderIcon,
	PencilIcon,
	PlusIcon,
	SearchIcon,
	SettingsIcon,
	SpinnerIcon,
	TrashIcon,
	XCircleIcon,
	XIcon,
} from "./icons";

const meta = {
	title: "Primitives/Icon",
	component: Icon,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"],
			description: "Icon size",
		},
	},
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

// Size: Extra Small
const xsBase: Story = {
	render: () => <SearchIcon size="xs" />,
};

const xsThemed = createThemedStories({
	story: xsBase,
	testMode: "light",
});

export const SizeXsLight = xsThemed.Light;
export const SizeXsDark = xsThemed.Dark;

// Size: Small
const smBase: Story = {
	render: () => <SearchIcon size="sm" />,
};

const smThemed = createThemedStories({
	story: smBase,
	testMode: "light",
});

export const SizeSmLight = smThemed.Light;
export const SizeSmDark = smThemed.Dark;

// Size: Medium (default)
const mdBase: Story = {
	render: () => <SearchIcon size="md" />,
};

const mdThemed = createThemedStories({
	story: mdBase,
	testMode: "light",
});

export const SizeMdLight = mdThemed.Light;
export const SizeMdDark = mdThemed.Dark;

// Size: Large
const lgBase: Story = {
	render: () => <SearchIcon size="lg" />,
};

const lgThemed = createThemedStories({
	story: lgBase,
	testMode: "light",
});

export const SizeLgLight = lgThemed.Light;
export const SizeLgDark = lgThemed.Dark;

// Size: Extra Large
const xlBase: Story = {
	render: () => <SearchIcon size="xl" />,
};

const xlThemed = createThemedStories({
	story: xlBase,
	testMode: "light",
});

export const SizeXlLight = xlThemed.Light;
export const SizeXlDark = xlThemed.Dark;

// Spinner (animated)
const spinnerBase: Story = {
	render: () => <SpinnerIcon size="md" />,
};

const spinnerThemed = createThemedStories({
	story: spinnerBase,
	testMode: "light",
});

export const SpinnerLight = spinnerThemed.Light;
export const SpinnerDark = spinnerThemed.Dark;

// Icon with label helper component
const IconWithLabel = (props: {
	icon: () => import("solid-js").JSX.Element;
	label: string;
}) => (
	<div class="flex flex-col items-center gap-2">
		{props.icon()}
		<span class="text-xs text-on-surface dark:text-on-surface-dark">
			{props.label}
		</span>
	</div>
);

// All Icons Showcase
const allIconsBase: Story = {
	render: () => (
		<div class="grid grid-cols-5 gap-6 p-4">
			<IconWithLabel icon={() => <SearchIcon size="lg" />} label="Search" />
			<IconWithLabel icon={() => <SpinnerIcon size="lg" />} label="Spinner" />
			<IconWithLabel icon={() => <XCircleIcon size="lg" />} label="XCircle" />
			<IconWithLabel icon={() => <XIcon size="lg" />} label="X" />
			<IconWithLabel icon={() => <CheckIcon size="lg" />} label="Check" />
			<IconWithLabel
				icon={() => <ChevronDownIcon size="lg" />}
				label="ChevronDown"
			/>
			<IconWithLabel
				icon={() => <ChevronUpIcon size="lg" />}
				label="ChevronUp"
			/>
			<IconWithLabel
				icon={() => <ChevronRightIcon size="lg" />}
				label="ChevronRight"
			/>
			<IconWithLabel icon={() => <PencilIcon size="lg" />} label="Pencil" />
			<IconWithLabel icon={() => <PlusIcon size="lg" />} label="Plus" />
			<IconWithLabel icon={() => <FolderIcon size="lg" />} label="Folder" />
			<IconWithLabel icon={() => <SettingsIcon size="lg" />} label="Settings" />
			<IconWithLabel icon={() => <DocumentIcon size="lg" />} label="Document" />
			<IconWithLabel
				icon={() => <ExternalLinkIcon size="lg" />}
				label="ExternalLink"
			/>
			<IconWithLabel icon={() => <TrashIcon size="lg" />} label="Trash" />
		</div>
	),
};

const allIconsThemed = createThemedStories({
	story: allIconsBase,
	testMode: "light",
});

export const AllIconsLight = allIconsThemed.Light;
export const AllIconsDark = allIconsThemed.Dark;

// All Sizes Showcase
const allSizesBase: Story = {
	render: () => (
		<div class="flex items-end gap-6 p-4">
			<IconWithLabel icon={() => <SearchIcon size="xs" />} label="xs" />
			<IconWithLabel icon={() => <SearchIcon size="sm" />} label="sm" />
			<IconWithLabel icon={() => <SearchIcon size="md" />} label="md" />
			<IconWithLabel icon={() => <SearchIcon size="lg" />} label="lg" />
			<IconWithLabel icon={() => <SearchIcon size="xl" />} label="xl" />
		</div>
	),
};

const allSizesThemed = createThemedStories({
	story: allSizesBase,
	testMode: "light",
});

export const AllSizesLight = allSizesThemed.Light;
export const AllSizesDark = allSizesThemed.Dark;
