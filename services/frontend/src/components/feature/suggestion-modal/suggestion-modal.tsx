import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { PencilIcon } from "@/components/primitives/icon";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SuggestionForm } from "./suggestion-form";
import { SuggestionList, type SuggestionListProps } from "./suggestion-list";

export interface SuggestionModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	isLoggedIn: boolean;
	onLoginClick?: () => void;
	pendingSuggestions: SuggestionListProps["suggestions"];
	currentUserId: string | null;
	onVote: (suggestionId: string, vote: "approve" | "reject") => void;
	formContent?: JSX.Element;
	onSubmit?: (justification?: string) => void;
	submitLabel?: string;
	isSubmitting?: boolean;
	isFormDisabled?: boolean;
	showJustification?: boolean;
}

export const SuggestionModal = (props: SuggestionModalProps) => {
	return (
		<Dialog
			open={props.open}
			onOpenChange={props.onOpenChange}
			title={props.title}
			description={props.description}
			class="max-w-lg"
		>
			<Stack spacing="lg">
				<Show
					when={props.isLoggedIn}
					fallback={
						<div class="p-4 bg-surface-alt dark:bg-surface-dark-alt rounded-radius">
							<Stack spacing="sm" align="center">
								<Text size="sm" color="muted" class="text-center">
									Sign in to suggest changes and vote on suggestions.
								</Text>
								<Button
									variant="primary"
									size="sm"
									onClick={props.onLoginClick}
								>
									Sign in
								</Button>
							</Stack>
						</div>
					}
				>
					<Show when={props.formContent && props.onSubmit}>
						{(_) => (
							<div class="border-b border-outline dark:border-outline-dark pb-4">
								<Text weight="semibold" class="mb-3">
									Create Suggestion
								</Text>
								<SuggestionForm
									onSubmit={props.onSubmit as (justification?: string) => void}
									submitLabel={props.submitLabel}
									isSubmitting={props.isSubmitting}
									isDisabled={props.isFormDisabled}
									showJustification={props.showJustification}
								>
									{props.formContent}
								</SuggestionForm>
							</div>
						)}
					</Show>
				</Show>

				<div>
					<Text weight="semibold" class="mb-3">
						Pending Suggestions ({props.pendingSuggestions.length})
					</Text>
					<SuggestionList
						suggestions={props.pendingSuggestions}
						currentUserId={props.currentUserId}
						onVote={props.onVote}
					/>
				</div>

				<Text size="xs" color="muted">
					Suggestions need community votes to be approved.
				</Text>
			</Stack>
		</Dialog>
	);
};

export interface SuggestionTriggerProps {
	onClick: () => void;
	disabled?: boolean;
	class?: string;
}

export const SuggestionTrigger = (props: SuggestionTriggerProps) => {
	return (
		<button
			type="button"
			onClick={props.onClick}
			disabled={props.disabled}
			class={`inline-flex items-center justify-center w-6 h-6 rounded-radius text-on-surface-subtle dark:text-on-surface-dark-subtle hover:text-on-surface dark:hover:text-on-surface-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${props.class ?? ""}`}
			aria-label="Suggest changes"
		>
			<PencilIcon size="sm" />
		</button>
	);
};
