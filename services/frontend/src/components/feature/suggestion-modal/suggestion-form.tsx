import { createSignal, type JSX, Show } from "solid-js";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Textarea } from "@/components/primitives/textarea";
import { Button } from "@/components/ui/button";

export interface SuggestionFormProps {
	children: JSX.Element;
	onSubmit: (justification?: string) => void;
	submitLabel?: string;
	isSubmitting?: boolean;
	isDisabled?: boolean;
	showJustification?: boolean;
}

export const SuggestionForm = (props: SuggestionFormProps) => {
	const [justification, setJustification] = createSignal("");

	const handleSubmit = () => {
		const j = justification().trim();
		props.onSubmit(j || undefined);
		setJustification("");
	};

	return (
		<Stack spacing="md">
			{props.children}

			<Show when={props.showJustification !== false}>
				<div>
					<Text size="sm" weight="medium" class="mb-1">
						Justification (optional)
					</Text>
					<Textarea
						value={justification()}
						onInput={(e) => setJustification(e.currentTarget.value)}
						placeholder="Why should this be added?"
						rows={2}
					/>
				</div>
			</Show>

			<Button
				variant="primary"
				size="sm"
				onClick={handleSubmit}
				disabled={props.isDisabled || props.isSubmitting}
				class="self-end"
			>
				{props.isSubmitting
					? "Submitting..."
					: (props.submitLabel ?? "Suggest")}
			</Button>
		</Stack>
	);
};
