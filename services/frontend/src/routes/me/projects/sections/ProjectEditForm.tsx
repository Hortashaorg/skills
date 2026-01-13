import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Input } from "@/components/primitives/input";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Textarea } from "@/components/primitives/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ProjectEditFormProps = {
	name: string;
	description: string;
	isSaving: boolean;
	onNameChange: (value: string) => void;
	onDescriptionChange: (value: string) => void;
	onSave: () => void;
	onCancel: () => void;
};

export const ProjectEditForm = (props: ProjectEditFormProps) => {
	return (
		<Card padding="lg">
			<Stack spacing="md">
				<Heading level="h2">Edit Project</Heading>
				<div>
					<Text
						size="sm"
						weight="medium"
						class="mb-1 text-on-surface-strong dark:text-on-surface-dark-strong"
					>
						Name
					</Text>
					<Input
						type="text"
						value={props.name}
						onInput={(e) => props.onNameChange(e.currentTarget.value)}
						onKeyDown={(e) => {
							if (e.key === "Escape") props.onCancel();
						}}
						placeholder="Project name"
						disabled={props.isSaving}
						autofocus
					/>
				</div>
				<div>
					<Text
						size="sm"
						weight="medium"
						class="mb-1 text-on-surface-strong dark:text-on-surface-dark-strong"
					>
						Description{" "}
						<span class="font-normal text-on-surface-muted dark:text-on-surface-dark-muted">
							(optional)
						</span>
					</Text>
					<Textarea
						value={props.description}
						onInput={(e) => props.onDescriptionChange(e.currentTarget.value)}
						onKeyDown={(e) => {
							if (e.key === "Escape") props.onCancel();
						}}
						rows={3}
						placeholder="Add a description..."
						disabled={props.isSaving}
					/>
				</div>
				<Flex justify="end" gap="sm">
					<Button
						size="sm"
						variant="secondary"
						onClick={props.onCancel}
						disabled={props.isSaving}
					>
						Cancel
					</Button>
					<Button
						size="sm"
						variant="primary"
						onClick={props.onSave}
						disabled={props.isSaving || !props.name.trim()}
					>
						{props.isSaving ? "Saving..." : "Save Changes"}
					</Button>
				</Flex>
			</Stack>
		</Card>
	);
};
