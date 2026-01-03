import type { Row } from "@package/database/client";
import { createSignal, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Input } from "@/components/primitives/input";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Textarea } from "@/components/primitives/textarea";
import { Button } from "@/components/ui/button";

interface ProjectFormProps {
	project?: Row["projects"];
	onSubmit: (data: { name: string; description?: string }) => Promise<void>;
	onCancel: () => void;
	isSubmitting: boolean;
	error: string | null;
}

export const ProjectForm = (props: ProjectFormProps) => {
	const [name, setName] = createSignal(props.project?.name ?? "");
	const [description, setDescription] = createSignal(
		props.project?.description ?? "",
	);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		const trimmedName = name().trim();
		if (!trimmedName) return;

		await props.onSubmit({
			name: trimmedName,
			description: description().trim() || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit}>
			<Stack spacing="md">
				<div>
					<label
						for="name"
						class="block text-sm font-medium text-on-surface-strong dark:text-on-surface-dark-strong mb-1"
					>
						Name
					</label>
					<Input
						id="name"
						type="text"
						value={name()}
						onInput={(e) => setName(e.currentTarget.value)}
						placeholder="My Awesome Project"
						maxLength={100}
						required
					/>
				</div>

				<div>
					<label
						for="description"
						class="block text-sm font-medium text-on-surface-strong dark:text-on-surface-dark-strong mb-1"
					>
						Description
						<span class="text-on-surface-muted dark:text-on-surface-dark-muted font-normal">
							{" "}
							(optional)
						</span>
					</label>
					<Textarea
						id="description"
						value={description()}
						onInput={(e) => setDescription(e.currentTarget.value)}
						placeholder="A brief description of your project..."
						maxLength={500}
						rows={3}
					/>
				</div>

				<Show when={props.error}>
					<Text size="sm" color="danger">
						{props.error}
					</Text>
				</Show>

				<Flex justify="end" gap="sm" class="pt-2">
					<Button
						type="button"
						variant="secondary"
						onClick={props.onCancel}
						disabled={props.isSubmitting}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="primary"
						disabled={props.isSubmitting || !name().trim()}
					>
						{props.isSubmitting
							? "Saving..."
							: props.project
								? "Save Changes"
								: "Create Project"}
					</Button>
				</Flex>
			</Stack>
		</form>
	);
};
