import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Text } from "@/components/primitives/text";
import { createThemedStories } from "@/components/story-helpers";
import { Select } from "@/components/ui/select";
import {
	type SuggestionItem,
	SuggestionList,
	SuggestionModal,
	SuggestionTrigger,
} from "./index";

const mockSuggestions: SuggestionItem[] = [
	{
		id: "1",
		type: "add_tag",
		typeLabel: "Add tag",
		description: "TypeScript",
		justification:
			"This package is written in TypeScript and has type definitions",
		authorName: "John Doe",
		authorId: "user-1",
		votes: [
			{ accountId: "user-2", vote: "approve" },
			{ accountId: "user-3", vote: "approve" },
		],
	},
	{
		id: "2",
		type: "add_tag",
		typeLabel: "Add tag",
		description: "Testing",
		authorName: "Jane Smith",
		authorId: "user-2",
		votes: [
			{ accountId: "user-1", vote: "approve" },
			{ accountId: "user-3", vote: "reject" },
		],
	},
	{
		id: "3",
		type: "add_ecosystem_package",
		typeLabel: "Add to ecosystem",
		description: "lodash",
		justification: "Essential utility library commonly used in React projects",
		authorName: "Current User",
		authorId: "current-user",
		votes: [],
	},
];

const mockTagOptions = [
	{ value: "frontend", label: "Frontend" },
	{ value: "backend", label: "Backend" },
	{ value: "testing", label: "Testing" },
	{ value: "typescript", label: "TypeScript" },
];

const meta = {
	title: "Feature/SuggestionModal",
	component: SuggestionModal,
	tags: ["autodocs"],
} satisfies Meta<typeof SuggestionModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultBase: Story = {
	render: () => {
		const [open, setOpen] = createSignal(true);
		const [selectedTag, setSelectedTag] = createSignal<string>();

		return (
			<div class="p-4 text-on-surface dark:text-on-surface-dark">
				<SuggestionModal
					open={open()}
					onOpenChange={setOpen}
					title="Suggest Tags"
					description="Help improve this package by suggesting relevant tags."
					isLoggedIn={true}
					currentUserId="current-user"
					pendingSuggestions={mockSuggestions}
					onVote={(id, vote) => console.log("Vote:", id, vote)}
					onSubmit={(justification) =>
						console.log("Submit:", selectedTag(), justification)
					}
					submitLabel="Suggest Tag"
					formContent={
						<Select
							options={mockTagOptions}
							value={selectedTag()}
							onChange={setSelectedTag}
							placeholder="Select a tag..."
							size="sm"
						/>
					}
					isFormDisabled={!selectedTag()}
				/>
			</div>
		);
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "light",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const loggedOutBase: Story = {
	render: () => {
		const [open, setOpen] = createSignal(true);

		return (
			<div class="p-4 text-on-surface dark:text-on-surface-dark">
				<SuggestionModal
					open={open()}
					onOpenChange={setOpen}
					title="Suggest Tags"
					description="Help improve this package by suggesting relevant tags."
					isLoggedIn={false}
					currentUserId={null}
					pendingSuggestions={mockSuggestions}
					onVote={() => {}}
					onLoginClick={() => console.log("Login clicked")}
				/>
			</div>
		);
	},
};

const loggedOutThemed = createThemedStories({
	story: loggedOutBase,
	testMode: "light",
});

export const LoggedOutLight = loggedOutThemed.Light;
export const LoggedOutDark = loggedOutThemed.Dark;

const emptyBase: Story = {
	render: () => {
		const [open, setOpen] = createSignal(true);
		const [selectedTag, setSelectedTag] = createSignal<string>();

		return (
			<div class="p-4 text-on-surface dark:text-on-surface-dark">
				<SuggestionModal
					open={open()}
					onOpenChange={setOpen}
					title="Suggest Tags"
					description="Help improve this package by suggesting relevant tags."
					isLoggedIn={true}
					currentUserId="current-user"
					pendingSuggestions={[]}
					onVote={() => {}}
					onSubmit={(justification) =>
						console.log("Submit:", selectedTag(), justification)
					}
					formContent={
						<Select
							options={mockTagOptions}
							value={selectedTag()}
							onChange={setSelectedTag}
							placeholder="Select a tag..."
							size="sm"
						/>
					}
					isFormDisabled={!selectedTag()}
				/>
			</div>
		);
	},
};

const emptyThemed = createThemedStories({
	story: emptyBase,
	testMode: "light",
});

export const EmptyLight = emptyThemed.Light;
export const EmptyDark = emptyThemed.Dark;

const listBase: Story = {
	render: () => {
		return (
			<div class="p-4 max-w-md text-on-surface dark:text-on-surface-dark">
				<SuggestionList
					suggestions={mockSuggestions}
					currentUserId="user-4"
					onVote={(id, vote) => console.log("Vote:", id, vote)}
				/>
			</div>
		);
	},
};

const listThemed = createThemedStories({
	story: listBase,
	testMode: "light",
});

export const ListLight = listThemed.Light;
export const ListDark = listThemed.Dark;

const triggerBase: Story = {
	render: () => {
		return (
			<div class="p-4 flex items-center gap-4 text-on-surface dark:text-on-surface-dark">
				<Text>Some editable content</Text>
				<SuggestionTrigger onClick={() => console.log("Trigger clicked")} />
			</div>
		);
	},
};

const triggerThemed = createThemedStories({
	story: triggerBase,
	testMode: "light",
});

export const TriggerLight = triggerThemed.Light;
export const TriggerDark = triggerThemed.Dark;
