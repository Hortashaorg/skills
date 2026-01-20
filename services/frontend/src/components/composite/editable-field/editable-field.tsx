import type { JSX } from "solid-js";
import { PencilIcon } from "@/components/primitives/icon";
import { cn } from "@/lib/utils";

export interface EditableFieldProps {
	children: JSX.Element;
	onEdit: () => void;
	disabled?: boolean;
	class?: string;
}

export const EditableField = (props: EditableFieldProps) => {
	return (
		<div
			class={cn("group relative inline-flex items-center gap-1", props.class)}
		>
			{props.children}
			<button
				type="button"
				onClick={() => props.onEdit()}
				disabled={props.disabled}
				class={cn(
					"inline-flex items-center justify-center",
					"p-1 rounded-radius",
					"text-on-surface-muted dark:text-on-surface-dark-muted",
					"hover:text-on-surface dark:hover:text-on-surface-dark",
					"hover:bg-surface-alt dark:hover:bg-surface-dark-alt",
					"opacity-0 group-hover:opacity-100",
					"focus-visible:opacity-100",
					"focus-visible:outline-none focus-visible:ring-2",
					"focus-visible:ring-primary dark:focus-visible:ring-primary-dark",
					"transition-opacity cursor-pointer",
					"disabled:opacity-50 disabled:cursor-not-allowed",
				)}
				title={props.disabled ? "Login to suggest changes" : "Suggest changes"}
			>
				<PencilIcon size="xs" />
			</button>
		</div>
	);
};
