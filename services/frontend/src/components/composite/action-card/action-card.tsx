import type { Component, JSX } from "solid-js";
import { splitProps } from "solid-js";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ActionCardProps {
	/** Icon component to display in the circular badge */
	icon: JSX.Element;
	/** Main title text */
	title: string;
	/** Optional description text */
	description?: string;
	/** Click handler */
	onClick: () => void;
	/** Whether the card is disabled */
	disabled?: boolean;
	/** Additional class names */
	class?: string;
}

/**
 * ActionCard - A clickable card with icon, title, and optional description.
 * Used for action prompts like "Suggest Package", "Request Package", etc.
 */
export const ActionCard: Component<ActionCardProps> = (props) => {
	const [local, others] = splitProps(props, [
		"icon",
		"title",
		"description",
		"onClick",
		"disabled",
		"class",
	]);

	return (
		<button
			type="button"
			onClick={local.onClick}
			disabled={local.disabled}
			class={cn(
				"text-left h-full w-full cursor-pointer",
				"disabled:cursor-not-allowed disabled:opacity-50",
				local.class,
			)}
			{...others}
		>
			<Card
				padding="md"
				class={cn(
					"h-full border-dashed transition-colors",
					!local.disabled && [
						"hover:bg-surface-alt dark:hover:bg-surface-dark-alt",
						"hover:border-primary dark:hover:border-primary-dark",
					],
				)}
			>
				<div class="flex items-center gap-3 h-full py-2">
					<div
						class={cn(
							"flex items-center justify-center",
							"size-9 rounded-full",
							"bg-primary/10 dark:bg-primary-dark/10",
						)}
					>
						{local.icon}
					</div>
					<Stack spacing="xs">
						<Text weight="medium" color="muted">
							{local.title}
						</Text>
						{local.description && (
							<Text size="xs" color="muted">
								{local.description}
							</Text>
						)}
					</Stack>
				</div>
			</Card>
		</button>
	);
};
