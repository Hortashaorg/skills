import type { Component, JSX } from "solid-js";
import { EntityPickerDialog } from "./entity-picker-dialog";
import { EntityPickerInline } from "./entity-picker-inline";

export interface PickerItem {
	id: string;
	primary: string;
	secondary?: string;
	label?: string;
}

export interface EntityPickerBaseProps<T extends PickerItem> {
	searchValue: string;
	onSearchChange: (value: string) => void;
	items: readonly T[];
	isLoading?: boolean;
	onSelect: (item: T) => void;
	placeholder?: string;
	noResultsMessage?: string;
	renderItem?: (item: T) => JSX.Element;
	class?: string;
}

export interface EntityPickerInlineProps<T extends PickerItem>
	extends EntityPickerBaseProps<T> {
	mode: "inline";
	label?: string;
}

export interface EntityPickerDialogProps<T extends PickerItem>
	extends EntityPickerBaseProps<T> {
	mode: "dialog";
	dialogTitle: string;
	dialogDescription?: string;
	triggerLabel: string;
	triggerIcon?: Component<{ size?: "sm" | "md" | "lg" }>;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export type EntityPickerProps<T extends PickerItem> =
	| EntityPickerInlineProps<T>
	| EntityPickerDialogProps<T>;

export const EntityPicker = <T extends PickerItem>(
	props: EntityPickerProps<T>,
) => {
	if (props.mode === "inline") {
		return <EntityPickerInline {...props} />;
	}
	return <EntityPickerDialog {...props} />;
};
