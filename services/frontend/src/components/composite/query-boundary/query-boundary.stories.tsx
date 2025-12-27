import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { createThemedStories } from "@/components/story-helpers";
import { Card } from "@/components/ui/card";
import { QueryBoundary } from "./query-boundary";

const meta = {
	title: "Composite/QueryBoundary",
	component: QueryBoundary,
	tags: ["autodocs"],
	argTypes: {
		isLoading: {
			control: "boolean",
			description: "Whether the query is still loading",
		},
		hasData: {
			control: "boolean",
			description: "Custom check for whether data exists",
		},
	},
} satisfies Meta<typeof QueryBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

const loadingBase: Story = {
	args: {
		data: undefined,
		isLoading: true,
		children: () => <div>This should not be visible</div>,
	},
};

const loadingThemed = createThemedStories({
	story: loadingBase,
	testMode: "both",
});

export const LoadingLight = loadingThemed.Light;
export const LoadingDark = loadingThemed.Dark;

const emptyArrayBase: Story = {
	args: {
		data: [],
		isLoading: false,
		emptyFallback: (
			<Card padding="lg">
				<Stack spacing="sm" align="center">
					<Text weight="semibold">No results found</Text>
					<Text color="muted" size="sm">
						Try adjusting your search criteria.
					</Text>
				</Stack>
			</Card>
		),
		children: () => <div>This should not be visible</div>,
	},
};

const emptyArrayThemed = createThemedStories({
	story: emptyArrayBase,
	testMode: "both",
});

export const EmptyArrayLight = emptyArrayThemed.Light;
export const EmptyArrayDark = emptyArrayThemed.Dark;

const emptyObjectBase: Story = {
	args: {
		data: null,
		isLoading: false,
		hasData: false,
		emptyFallback: (
			<Card padding="lg">
				<Stack spacing="sm" align="center">
					<Text weight="semibold">Package not found</Text>
					<Text color="muted" size="sm">
						The requested package does not exist.
					</Text>
				</Stack>
			</Card>
		),
		children: () => <div>This should not be visible</div>,
	},
};

const emptyObjectThemed = createThemedStories({
	story: emptyObjectBase,
	testMode: "both",
});

export const EmptyObjectLight = emptyObjectThemed.Light;
export const EmptyObjectDark = emptyObjectThemed.Dark;

const withArrayDataBase: Story = {
	args: {
		data: [
			{ id: "1", name: "Package A" },
			{ id: "2", name: "Package B" },
			{ id: "3", name: "Package C" },
		],
		isLoading: false,
		emptyFallback: <div>No results</div>,
		children: (packages: { id: string; name: string }[]) => (
			<Card padding="md">
				<Stack spacing="sm">
					<Text weight="semibold">Found {packages.length} packages:</Text>
					{packages.map((pkg) => (
						<Text size="sm" color="muted">
							{pkg.name}
						</Text>
					))}
				</Stack>
			</Card>
		),
	},
};

const withArrayDataThemed = createThemedStories({
	story: withArrayDataBase,
	testMode: "both",
});

export const WithArrayDataLight = withArrayDataThemed.Light;
export const WithArrayDataDark = withArrayDataThemed.Dark;

const withObjectDataBase: Story = {
	args: {
		data: { id: "1", name: "react", version: "18.2.0" },
		isLoading: false,
		hasData: true,
		emptyFallback: <div>Not found</div>,
		children: (pkg: { id: string; name: string; version: string }) => (
			<Card padding="md">
				<Stack spacing="sm">
					<Text weight="semibold">{pkg.name}</Text>
					<Text size="sm" color="muted">
						Version {pkg.version}
					</Text>
				</Stack>
			</Card>
		),
	},
};

const withObjectDataThemed = createThemedStories({
	story: withObjectDataBase,
	testMode: "both",
});

export const WithObjectDataLight = withObjectDataThemed.Light;
export const WithObjectDataDark = withObjectDataThemed.Dark;
