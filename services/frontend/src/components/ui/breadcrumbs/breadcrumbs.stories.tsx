import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Breadcrumbs } from "./breadcrumbs";

const meta = {
	title: "UI/Breadcrumbs",
	component: Breadcrumbs.Root,
	tags: ["autodocs"],
} satisfies Meta<typeof Breadcrumbs.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultBase: Story = {
	render: () => (
		<Breadcrumbs.Root>
			<Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
			<Breadcrumbs.Link href="/package/npm/lodash">npm</Breadcrumbs.Link>
			<Breadcrumbs.Link current>lodash</Breadcrumbs.Link>
		</Breadcrumbs.Root>
	),
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const adminBase: Story = {
	render: () => (
		<Breadcrumbs.Root>
			<Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
			<Breadcrumbs.Link href="/admin">Admin</Breadcrumbs.Link>
			<Breadcrumbs.Link current>Package Requests</Breadcrumbs.Link>
		</Breadcrumbs.Root>
	),
};

const adminThemed = createThemedStories({
	story: adminBase,
	testMode: "both",
});

export const AdminLight = adminThemed.Light;
export const AdminDark = adminThemed.Dark;

const scopedPackageBase: Story = {
	render: () => (
		<Breadcrumbs.Root>
			<Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
			<Breadcrumbs.Link href="/package/npm/%40types%2Fnode">
				npm
			</Breadcrumbs.Link>
			<Breadcrumbs.Link current>@types/node</Breadcrumbs.Link>
		</Breadcrumbs.Root>
	),
};

const scopedPackageThemed = createThemedStories({
	story: scopedPackageBase,
	testMode: "both",
});

export const ScopedPackageLight = scopedPackageThemed.Light;
export const ScopedPackageDark = scopedPackageThemed.Dark;

const customSeparatorBase: Story = {
	render: () => (
		<Breadcrumbs.Root
			separator={<span class="mx-2 text-on-surface-muted">/</span>}
		>
			<Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
			<Breadcrumbs.Link href="/admin">Admin</Breadcrumbs.Link>
			<Breadcrumbs.Link current>Tags</Breadcrumbs.Link>
		</Breadcrumbs.Root>
	),
};

const customSeparatorThemed = createThemedStories({
	story: customSeparatorBase,
	testMode: "both",
});

export const CustomSeparatorLight = customSeparatorThemed.Light;
export const CustomSeparatorDark = customSeparatorThemed.Dark;

const allVariantsBase: Story = {
	render: () => (
		<div style={{ display: "flex", "flex-direction": "column", gap: "1.5rem" }}>
			<div>
				<p class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted mb-2">
					Package page:
				</p>
				<Breadcrumbs.Root aria-label="Package navigation">
					<Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
					<Breadcrumbs.Link href="/package/npm/react">npm</Breadcrumbs.Link>
					<Breadcrumbs.Link current>react</Breadcrumbs.Link>
				</Breadcrumbs.Root>
			</div>
			<div>
				<p class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted mb-2">
					Admin page:
				</p>
				<Breadcrumbs.Root aria-label="Admin navigation">
					<Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
					<Breadcrumbs.Link href="/admin">Admin</Breadcrumbs.Link>
					<Breadcrumbs.Link current>Tags</Breadcrumbs.Link>
				</Breadcrumbs.Root>
			</div>
			<div>
				<p class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted mb-2">
					Scoped package:
				</p>
				<Breadcrumbs.Root aria-label="Scoped package navigation">
					<Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
					<Breadcrumbs.Link href="/package/jsr/%40std%2Fpath">
						jsr
					</Breadcrumbs.Link>
					<Breadcrumbs.Link current>@std/path</Breadcrumbs.Link>
				</Breadcrumbs.Root>
			</div>
		</div>
	),
};

const allVariantsThemed = createThemedStories({
	story: allVariantsBase,
	testMode: "light",
});

export const AllVariantsLight = allVariantsThemed.Light;
export const AllVariantsDark = allVariantsThemed.Dark;
