import type { Row } from "@package/database/client";
import { createSignal, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
	TextField,
	TextFieldInput,
	TextFieldLabel,
} from "@/components/ui/text-field";

type TagWithPackages = Row["tags"] & {
	packageTags: readonly Row["packageTags"][];
};

type Props = {
	editingTag: TagWithPackages | null;
	onSave: (data: { name: string; description?: string }) => Promise<void>;
	onCancel: () => void;
};

export const TagForm = (props: Props) => {
	const [name, setName] = createSignal(props.editingTag?.name ?? "");
	const [description, setDescription] = createSignal(
		props.editingTag?.description ?? "",
	);
	const [error, setError] = createSignal<string>();
	const [isSubmitting, setIsSubmitting] = createSignal(false);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		setError(undefined);

		const nameValue = name().trim();
		if (!nameValue) {
			setError("Name is required");
			return;
		}

		if (nameValue.length > 50) {
			setError("Name must be 50 characters or less");
			return;
		}

		const descValue = description().trim();
		if (descValue.length > 200) {
			setError("Description must be 200 characters or less");
			return;
		}

		setIsSubmitting(true);
		try {
			await props.onSave({
				name: nameValue,
				description: descValue || undefined,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<Stack spacing="md">
				<Text weight="semibold">
					{props.editingTag ? "Edit Tag" : "Create New Tag"}
				</Text>

				<TextField value={name()} onChange={setName} required>
					<TextFieldLabel>Name</TextFieldLabel>
					<TextFieldInput placeholder="e.g. Frontend, Backend, Testing" />
				</TextField>

				<TextField value={description()} onChange={setDescription}>
					<TextFieldLabel>Description (optional)</TextFieldLabel>
					<TextFieldInput placeholder="Brief description of this tag" />
				</TextField>

				<Show when={error()}>
					<Text size="sm" class="text-danger dark:text-danger-dark">
						{error()}
					</Text>
				</Show>

				<Flex gap="sm" justify="end">
					<Button
						type="button"
						variant="outline"
						onClick={props.onCancel}
						disabled={isSubmitting()}
					>
						Cancel
					</Button>
					<Button type="submit" variant="primary" disabled={isSubmitting()}>
						<Show
							when={isSubmitting()}
							fallback={props.editingTag ? "Update" : "Create"}
						>
							<Spinner size="sm" srText="Saving tag" />
							<span class="ml-2">Saving...</span>
						</Show>
					</Button>
				</Flex>
			</Stack>
		</form>
	);
};
