import { Dialog as DialogPrimitive } from "@kobalte/core/dialog";
import type { JSX } from "solid-js";
import { Show, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const overlayStyles = [
	"fixed",
	"inset-0",
	"z-50",
	"bg-black/50",
	"ui-expanded:animate-in",
	"ui-expanded:fade-in-0",
	"ui-closed:animate-out",
	"ui-closed:fade-out-0",
];

const contentStyles = [
	"fixed",
	"left-1/2",
	"top-1/2",
	"z-50",
	"w-full",
	"max-w-md",
	"-translate-x-1/2",
	"-translate-y-1/2",
	"rounded-radius",
	"border",
	"border-outline",
	"bg-surface",
	"p-6",
	"shadow-lg",
	"dark:border-outline-dark",
	"dark:bg-surface-dark",
	"ui-expanded:animate-in",
	"ui-expanded:fade-in-0",
	"ui-expanded:zoom-in-95",
	"ui-closed:animate-out",
	"ui-closed:fade-out-0",
	"ui-closed:zoom-out-95",
];

export interface DialogProps {
	title: string;
	description?: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: JSX.Element;
	class?: string;
}

export const Dialog = (props: DialogProps) => {
	const [local, others] = splitProps(props, [
		"title",
		"description",
		"open",
		"onOpenChange",
		"children",
		"class",
	]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			// Blur any focused element before closing to prevent aria-hidden warning
			// This happens when a Select listbox is open inside the dialog
			const activeElement = document.activeElement as HTMLElement | null;
			activeElement?.blur?.();
		}
		local.onOpenChange?.(open);
	};

	return (
		<DialogPrimitive
			open={local.open}
			onOpenChange={handleOpenChange}
			{...others}
		>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay class={cn(overlayStyles)} />
				<DialogPrimitive.Content class={cn(contentStyles, local.class)}>
					<DialogPrimitive.Title class="text-lg font-semibold text-on-surface-strong dark:text-on-surface-dark-strong">
						{local.title}
					</DialogPrimitive.Title>
					<Show when={local.description}>
						<DialogPrimitive.Description class="mt-2 text-sm text-on-surface dark:text-on-surface-dark">
							{local.description}
						</DialogPrimitive.Description>
					</Show>
					<div class="mt-4">{local.children}</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive>
	);
};
