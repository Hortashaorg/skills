import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Badge } from "@/components/ui/badge";
import { Table } from "./table";

const meta = {
	title: "UI/Table",
	component: Table,
	tags: ["autodocs"],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicBase: Story = {
	render: () => (
		<Table>
			<Table.Header>
				<Table.Row header>
					<Table.Head>Name</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head align="right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Table.Row>
					<Table.Cell>Package A</Table.Cell>
					<Table.Cell>
						<Badge variant="success" size="sm">
							Active
						</Badge>
					</Table.Cell>
					<Table.Cell align="right">Edit</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>Package B</Table.Cell>
					<Table.Cell>
						<Badge variant="warning" size="sm">
							Pending
						</Badge>
					</Table.Cell>
					<Table.Cell align="right">Edit</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>Package C</Table.Cell>
					<Table.Cell>
						<Badge variant="danger" size="sm">
							Failed
						</Badge>
					</Table.Cell>
					<Table.Cell align="right">Edit</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table>
	),
};

const basicThemed = createThemedStories({
	story: basicBase,
	testMode: "light",
});

export const BasicLight = basicThemed.Light;
export const BasicDark = basicThemed.Dark;

const hoverableBase: Story = {
	render: () => (
		<Table>
			<Table.Header>
				<Table.Row header>
					<Table.Head>Name</Table.Head>
					<Table.Head>Description</Table.Head>
					<Table.Head>Count</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Table.Row hoverable>
					<Table.Cell>Frontend</Table.Cell>
					<Table.Cell class="text-on-surface-muted dark:text-on-surface-dark-muted">
						UI frameworks and libraries
					</Table.Cell>
					<Table.Cell>
						<Badge variant="info" size="sm">
							24
						</Badge>
					</Table.Cell>
				</Table.Row>
				<Table.Row hoverable>
					<Table.Cell>Backend</Table.Cell>
					<Table.Cell class="text-on-surface-muted dark:text-on-surface-dark-muted">
						Server-side technologies
					</Table.Cell>
					<Table.Cell>
						<Badge variant="info" size="sm">
							18
						</Badge>
					</Table.Cell>
				</Table.Row>
				<Table.Row hoverable>
					<Table.Cell>Testing</Table.Cell>
					<Table.Cell class="text-on-surface-muted dark:text-on-surface-dark-muted">
						Test frameworks and utilities
					</Table.Cell>
					<Table.Cell>
						<Badge variant="info" size="sm">
							12
						</Badge>
					</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table>
	),
};

const hoverableThemed = createThemedStories({
	story: hoverableBase,
	testMode: "light",
});

export const HoverableLight = hoverableThemed.Light;
export const HoverableDark = hoverableThemed.Dark;

const alignmentBase: Story = {
	render: () => (
		<Table>
			<Table.Header>
				<Table.Row header>
					<Table.Head>Left (default)</Table.Head>
					<Table.Head align="center">Center</Table.Head>
					<Table.Head align="right">Right</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Table.Row>
					<Table.Cell>Left aligned</Table.Cell>
					<Table.Cell align="center">Center aligned</Table.Cell>
					<Table.Cell align="right">Right aligned</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>Another row</Table.Cell>
					<Table.Cell align="center">With values</Table.Cell>
					<Table.Cell align="right">$99.99</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table>
	),
};

const alignmentThemed = createThemedStories({
	story: alignmentBase,
	testMode: "light",
});

export const AlignmentLight = alignmentThemed.Light;
export const AlignmentDark = alignmentThemed.Dark;
