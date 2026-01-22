import { AlertDialog as AlertDialogPrimitive } from "@kobalte/core/alert-dialog";
import { Show, splitProps } from "solid-js";
import { Button } from "@/components/ui/button";
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

export interface AlertDialogProps {
	/** The title of the alert dialog */
	title: string;
	/** The description/message of the alert dialog */
	description?: string;
	/** Text for the confirm button */
	confirmText?: string;
	/** Text for the cancel button */
	cancelText?: string;
	/** Called when the confirm button is clicked */
	onConfirm?: () => void;
	/** Called when the dialog is cancelled */
	onCancel?: () => void;
	/** Controlled open state */
	open?: boolean;
	/** Called when open state changes */
	onOpenChange?: (open: boolean) => void;
	/** Visual variant - "danger" shows a red confirm button */
	variant?: "default" | "danger";
	/** Additional class for the content container */
	class?: string;
}

export const AlertDialog = (props: AlertDialogProps) => {
	let cancelButtonRef: HTMLButtonElement | undefined;

	const [local, others] = splitProps(props, [
		"title",
		"description",
		"confirmText",
		"cancelText",
		"onConfirm",
		"onCancel",
		"open",
		"onOpenChange",
		"variant",
		"class",
	]);

	const handleConfirm = async () => {
		await local.onConfirm?.();
		local.onOpenChange?.(false);
	};

	const handleCancel = () => {
		local.onCancel?.();
		local.onOpenChange?.(false);
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			// Blur any focused element before closing to prevent aria-hidden warning
			const activeElement = document.activeElement as HTMLElement | null;
			activeElement?.blur?.();
		}
		local.onOpenChange?.(open);
	};

	const handleOpenAutoFocus = (e: Event) => {
		e.preventDefault();
		cancelButtonRef?.focus();
	};

	return (
		<AlertDialogPrimitive
			open={local.open}
			onOpenChange={handleOpenChange}
			{...others}
		>
			<AlertDialogPrimitive.Portal>
				<AlertDialogPrimitive.Overlay class={cn(overlayStyles)} />
				<AlertDialogPrimitive.Content
					class={cn(contentStyles, local.class)}
					onOpenAutoFocus={handleOpenAutoFocus}
				>
					<AlertDialogPrimitive.Title class="text-lg font-semibold text-on-surface-strong dark:text-on-surface-dark-strong">
						{local.title}
					</AlertDialogPrimitive.Title>
					<Show when={local.description}>
						<AlertDialogPrimitive.Description class="mt-2 text-sm text-on-surface dark:text-on-surface-dark">
							{local.description}
						</AlertDialogPrimitive.Description>
					</Show>
					<div class="mt-6 flex justify-end gap-3">
						<AlertDialogPrimitive.CloseButton
							as={Button}
							ref={cancelButtonRef}
							variant="secondary"
							size="sm"
							onClick={handleCancel}
						>
							{local.cancelText ?? "Cancel"}
						</AlertDialogPrimitive.CloseButton>
						<Button
							variant={local.variant === "danger" ? "danger" : "primary"}
							size="sm"
							onClick={handleConfirm}
						>
							{local.confirmText ?? "Confirm"}
						</Button>
					</div>
				</AlertDialogPrimitive.Content>
			</AlertDialogPrimitive.Portal>
		</AlertDialogPrimitive>
	);
};
