import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { PackageIcon, SearchIcon } from "@/components/primitives/icon";
import { createThemedStories } from "@/components/story-helpers";
import {
	EntityPicker,
	EntityPickerDialog,
	EntityPickerInline,
	type PickerItem,
} from "./index";

const mockItems: PickerItem[] = [
	{
		id: "1",
		primary: "react",
		secondary: "A JavaScript library for building user interfaces",
		label: "npm",
	},
	{
		id: "2",
		primary: "vue",
		secondary: "The Progressive JavaScript Framework",
		label: "npm",
	},
	{
		id: "3",
		primary: "svelte",
		secondary: "Cybernetically enhanced web apps",
		label: "npm",
	},
	{
		id: "4",
		primary: "solid-js",
		secondary: "A declarative, efficient, and flexible JavaScript library",
		label: "npm",
	},
	{
		id: "5",
		primary: "hono",
		secondary: "Fast, lightweight, built on Web Standards",
		label: "npm",
	},
];

const meta = {
	title: "Composite/EntityPicker",
	component: EntityPicker,
	tags: ["autodocs"],
	argTypes: {
		mode: {
			control: "select",
			options: ["inline", "dialog"],
			description: "Display mode for the picker",
		},
		searchValue: {
			control: "text",
			description: "Current search value",
		},
		isLoading: {
			control: "boolean",
			description: "Show loading state",
		},
		placeholder: {
			control: "text",
			description: "Placeholder text for the search input",
		},
	},
} satisfies Meta<typeof EntityPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const inlineBase: Story = {
	render: () => {
		const [search, setSearch] = createSignal("");
		const [selected, setSelected] = createSignal<PickerItem[]>([]);

		const filteredItems = () =>
			mockItems.filter((item) =>
				item.primary.toLowerCase().includes(search().toLowerCase()),
			);

		return (
			<div class="flex flex-col gap-4 p-4 w-80 text-on-surface dark:text-on-surface-dark">
				<EntityPickerInline
					mode="inline"
					searchValue={search()}
					onSearchChange={setSearch}
					items={filteredItems()}
					onSelect={(item) => setSelected((prev) => [...prev, item])}
					placeholder="Search packages..."
					label="Add Package"
				/>
				<div class="text-sm">
					Selected:{" "}
					{selected().length > 0
						? selected()
								.map((i) => i.primary)
								.join(", ")
						: "None"}
				</div>
			</div>
		);
	},
};

const inlineThemed = createThemedStories({
	story: inlineBase,
	testMode: "light",
});

export const InlineLight = inlineThemed.Light;
export const InlineDark = inlineThemed.Dark;

const inlineLoadingBase: Story = {
	render: () => {
		const [search, setSearch] = createSignal("react");

		return (
			<div class="p-4 w-80 text-on-surface dark:text-on-surface-dark">
				<EntityPickerInline
					mode="inline"
					searchValue={search()}
					onSearchChange={setSearch}
					items={[]}
					onSelect={() => {}}
					isLoading={true}
					placeholder="Search packages..."
				/>
			</div>
		);
	},
};

const inlineLoadingThemed = createThemedStories({
	story: inlineLoadingBase,
	testMode: "light",
});

export const InlineLoadingLight = inlineLoadingThemed.Light;
export const InlineLoadingDark = inlineLoadingThemed.Dark;

const dialogBase: Story = {
	render: () => {
		const [search, setSearch] = createSignal("");
		const [open, setOpen] = createSignal(false);
		const [selected, setSelected] = createSignal<PickerItem[]>([]);

		const filteredItems = () =>
			mockItems.filter((item) =>
				item.primary.toLowerCase().includes(search().toLowerCase()),
			);

		return (
			<div class="flex flex-col gap-4 p-4 text-on-surface dark:text-on-surface-dark">
				<EntityPickerDialog
					mode="dialog"
					searchValue={search()}
					onSearchChange={setSearch}
					items={filteredItems()}
					onSelect={(item) => setSelected((prev) => [...prev, item])}
					open={open()}
					onOpenChange={setOpen}
					dialogTitle="Add Package"
					dialogDescription="Search for packages to add to this ecosystem"
					triggerLabel="Add Package"
					placeholder="Search packages..."
				/>
				<div class="text-sm">
					Selected:{" "}
					{selected().length > 0
						? selected()
								.map((i) => i.primary)
								.join(", ")
						: "None"}
				</div>
			</div>
		);
	},
};

const dialogThemed = createThemedStories({
	story: dialogBase,
	testMode: "light",
});

export const DialogLight = dialogThemed.Light;
export const DialogDark = dialogThemed.Dark;

const dialogCustomIconBase: Story = {
	render: () => {
		const [search, setSearch] = createSignal("");
		const [open, setOpen] = createSignal(false);

		const filteredItems = () =>
			mockItems.filter((item) =>
				item.primary.toLowerCase().includes(search().toLowerCase()),
			);

		return (
			<div class="p-4 text-on-surface dark:text-on-surface-dark">
				<EntityPickerDialog
					mode="dialog"
					searchValue={search()}
					onSearchChange={setSearch}
					items={filteredItems()}
					onSelect={() => {}}
					open={open()}
					onOpenChange={setOpen}
					dialogTitle="Search Packages"
					triggerLabel="Search"
					triggerIcon={SearchIcon}
					placeholder="Type to search..."
				/>
			</div>
		);
	},
};

const dialogCustomIconThemed = createThemedStories({
	story: dialogCustomIconBase,
	testMode: "light",
});

export const DialogCustomIconLight = dialogCustomIconThemed.Light;
export const DialogCustomIconDark = dialogCustomIconThemed.Dark;

const noResultsBase: Story = {
	render: () => {
		const [search, setSearch] = createSignal("xyz");

		return (
			<div class="p-4 w-80 text-on-surface dark:text-on-surface-dark">
				<EntityPickerInline
					mode="inline"
					searchValue={search()}
					onSearchChange={setSearch}
					items={[]}
					onSelect={() => {}}
					placeholder="Search packages..."
					noResultsMessage="No packages found. Try a different search term."
				/>
			</div>
		);
	},
};

const noResultsThemed = createThemedStories({
	story: noResultsBase,
	testMode: "light",
});

export const NoResultsLight = noResultsThemed.Light;
export const NoResultsDark = noResultsThemed.Dark;

const customRenderBase: Story = {
	render: () => {
		const [search, setSearch] = createSignal("");

		const filteredItems = () =>
			mockItems.filter((item) =>
				item.primary.toLowerCase().includes(search().toLowerCase()),
			);

		return (
			<div class="p-4 w-96 text-on-surface dark:text-on-surface-dark">
				<EntityPickerInline
					mode="inline"
					searchValue={search()}
					onSearchChange={setSearch}
					items={filteredItems()}
					onSelect={() => {}}
					placeholder="Search packages..."
					renderItem={(item) => (
						<div class="flex items-center gap-3">
							<div class="w-8 h-8 rounded-radius bg-primary/10 dark:bg-primary-dark/10 flex items-center justify-center">
								<PackageIcon
									size="sm"
									class="text-primary dark:text-primary-dark"
								/>
							</div>
							<div class="flex-1">
								<div class="font-semibold text-on-surface dark:text-on-surface-dark">
									{item.primary}
								</div>
								<div class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted">
									{item.label}
								</div>
							</div>
						</div>
					)}
				/>
			</div>
		);
	},
};

const customRenderThemed = createThemedStories({
	story: customRenderBase,
	testMode: "light",
});

export const CustomRenderLight = customRenderThemed.Light;
export const CustomRenderDark = customRenderThemed.Dark;
