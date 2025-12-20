import { Select as SelectPrimitive } from "@kobalte/core/select";
import { cva, type VariantProps } from "class-variance-authority";
import { splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const selectTriggerVariants = cva(
	[
		"inline-flex",
		"items-center",
		"justify-between",
		"gap-2",
		"rounded-radius",
		"border",
		"bg-surface",
		"dark:bg-surface-dark",
		"border-outline",
		"dark:border-outline-dark",
		"text-on-surface",
		"dark:text-on-surface-dark",
		"transition-colors",
		"focus-visible:outline-2",
		"focus-visible:outline-offset-2",
		"focus-visible:outline-primary",
		"dark:focus-visible:outline-primary-dark",
		"disabled:cursor-not-allowed",
		"disabled:opacity-50",
		"cursor-pointer",
		"ui-invalid:border-danger",
	],
	{
		variants: {
			size: {
				sm: ["h-8", "px-2", "text-xs"],
				md: ["h-10", "px-3", "text-sm"],
				lg: ["h-12", "px-4", "text-base"],
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

const selectContentVariants = cva([
	"z-50",
	"min-w-32",
	"overflow-hidden",
	"rounded-radius",
	"border",
	"border-outline",
	"dark:border-outline-dark",
	"bg-surface",
	"dark:bg-surface-dark",
	"shadow-lg",
	"ui-expanded:animate-in",
	"ui-expanded:fade-in-0",
	"ui-expanded:zoom-in-95",
	"ui-closed:animate-out",
	"ui-closed:fade-out-0",
	"ui-closed:zoom-out-95",
]);

const selectItemVariants = cva([
	"relative",
	"flex",
	"w-full",
	"cursor-pointer",
	"select-none",
	"items-center",
	"rounded-sm",
	"py-1.5",
	"pl-8",
	"pr-2",
	"text-sm",
	"text-on-surface",
	"dark:text-on-surface-dark",
	"outline-none",
	"transition-colors",
	"hover:bg-surface-alt",
	"dark:hover:bg-surface-dark-alt",
	"ui-highlighted:bg-surface-alt",
	"dark:ui-highlighted:bg-surface-dark-alt",
	"ui-disabled:pointer-events-none",
	"ui-disabled:opacity-50",
]);

export type SelectOption<T> = {
	value: T;
	label: string;
	disabled?: boolean;
};

export type SelectProps<T> = {
	class?: string;
	/** Array of options to display */
	options: SelectOption<T>[];
	/** The currently selected value */
	value?: T;
	/** Callback when selection changes */
	onChange?: (value: T) => void;
	/** Placeholder text when no value is selected */
	placeholder?: string;
	/** Whether the select is disabled */
	disabled?: boolean;
	/** Whether the select is required */
	required?: boolean;
	/** Accessible label for the select */
	"aria-label"?: string;
} & VariantProps<typeof selectTriggerVariants>;

/**
 * A dropdown select component built on Kobalte.
 *
 * @example
 * ```tsx
 * const options = [
 *   { value: "apple", label: "Apple" },
 *   { value: "banana", label: "Banana" },
 * ];
 *
 * <Select
 *   options={options}
 *   value={value()}
 *   onChange={setValue}
 *   placeholder="Select a fruit..."
 * />
 * ```
 */
export function Select<T extends string>(props: SelectProps<T>) {
	const [local, others] = splitProps(props, [
		"class",
		"options",
		"value",
		"onChange",
		"placeholder",
		"disabled",
		"required",
		"size",
		"aria-label",
	]);

	return (
		<SelectPrimitive<SelectOption<T>>
			value={
				local.value
					? local.options.find((o) => o.value === local.value)
					: undefined
			}
			onChange={(option) => option && local.onChange?.(option.value)}
			options={local.options}
			optionValue="value"
			optionTextValue="label"
			optionDisabled="disabled"
			placeholder={local.placeholder}
			disabled={local.disabled}
			required={local.required}
			aria-label={local["aria-label"]}
			itemComponent={(itemProps) => (
				<SelectPrimitive.Item
					item={itemProps.item}
					class={cn(selectItemVariants())}
				>
					<SelectPrimitive.ItemLabel>
						{itemProps.item.rawValue.label}
					</SelectPrimitive.ItemLabel>
					<SelectPrimitive.ItemIndicator class="absolute left-2 inline-flex items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<title>Selected</title>
							<polyline points="20 6 9 17 4 12" />
						</svg>
					</SelectPrimitive.ItemIndicator>
				</SelectPrimitive.Item>
			)}
			{...others}
		>
			<SelectPrimitive.Trigger
				class={cn(
					selectTriggerVariants({ size: local.size }),
					"w-full",
					local.class,
				)}
			>
				<SelectPrimitive.Value<SelectOption<T>>>
					{(state) => state.selectedOption().label}
				</SelectPrimitive.Value>
				<SelectPrimitive.Icon class="text-on-surface-muted dark:text-on-surface-dark-muted">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<title>Expand</title>
						<path d="m6 9 6 6 6-6" />
					</svg>
				</SelectPrimitive.Icon>
			</SelectPrimitive.Trigger>
			<SelectPrimitive.Portal>
				<SelectPrimitive.Content class={cn(selectContentVariants())}>
					<SelectPrimitive.Listbox class="max-h-60 overflow-auto p-1" />
				</SelectPrimitive.Content>
			</SelectPrimitive.Portal>
		</SelectPrimitive>
	);
}
