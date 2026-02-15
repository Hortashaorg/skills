import { A } from "@solidjs/router";
import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, onCleanup, onMount, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import { Heading } from "@/components/primitives/heading";
import { XIcon } from "@/components/primitives/icon";
import { cn } from "@/lib/utils";

const sidePanelVariants = cva(
	[
		"fixed",
		"top-0",
		"z-40",
		"h-full",
		"w-full",
		"max-w-lg",
		"border-outline",
		"dark:border-outline-dark",
		"bg-surface",
		"dark:bg-surface-dark",
		"shadow-xl",
		"overflow-y-auto",
		"transition-transform",
		"duration-200",
		"ease-out",
	],
	{
		variants: {
			side: {
				right: ["right-0", "border-l"],
				left: ["left-0", "border-r"],
			},
		},
		defaultVariants: {
			side: "right",
		},
	},
);

export type SidePanelProps = {
	/** Whether the panel is visible */
	open: boolean;
	/** Called when the panel should close (Escape key, close button) */
	onClose: () => void;
	/** Which edge the panel slides in from */
	side?: "left" | "right";
	/** Panel heading, also used as accessible label */
	title: string;
	/** Optional link for the title (makes title clickable) */
	titleHref?: string;
	/** Panel content */
	children?: JSX.Element;
	/** Additional CSS classes for the panel container */
	class?: string;
	/** Ref callback to access the panel DOM element (e.g. for click-outside detection) */
	ref?: (el: HTMLElement) => void;
} & Omit<VariantProps<typeof sidePanelVariants>, "side">;

export const SidePanel = (props: SidePanelProps) => {
	const [local, others] = splitProps(props, [
		"open",
		"onClose",
		"side",
		"title",
		"titleHref",
		"children",
		"class",
		"ref",
	]);

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Escape" && local.open) local.onClose();
	};

	onMount(() => {
		document.addEventListener("keydown", handleKeyDown);
		onCleanup(() => {
			document.removeEventListener("keydown", handleKeyDown);
		});
	});

	const translateHidden = () =>
		local.side === "left" ? "-translate-x-full" : "translate-x-full";

	return (
		<Portal>
			<aside
				ref={(el) => local.ref?.(el)}
				aria-label={local.title}
				class={cn(
					sidePanelVariants({ side: local.side ?? "right" }),
					local.open ? "translate-x-0" : translateHidden(),
					local.class,
				)}
				{...others}
			>
				<div class="flex items-start justify-between gap-4 border-b border-outline dark:border-outline-dark p-4">
					<Show
						when={local.titleHref}
						fallback={<Heading level="h2">{local.title}</Heading>}
					>
						{(href) => (
							<A href={href()} class="hover:underline">
								<Heading level="h2">{local.title}</Heading>
							</A>
						)}
					</Show>
					<button
						type="button"
						onClick={local.onClose}
						aria-label="Close"
						class="shrink-0 rounded-radius p-1 text-on-surface-muted dark:text-on-surface-dark-muted hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition-colors"
					>
						<XIcon size="sm" />
					</button>
				</div>
				<div class="p-4">{local.children}</div>
			</aside>
		</Portal>
	);
};
