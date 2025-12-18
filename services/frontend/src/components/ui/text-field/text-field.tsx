import type { PolymorphicProps } from "@kobalte/core";
import * as TextFieldPrimitive from "@kobalte/core/text-field";
import { cva } from "class-variance-authority";
import type { ValidComponent } from "solid-js";
import { mergeProps, splitProps } from "solid-js";

import { cn } from "@/lib/utils";

type TextFieldRootProps<T extends ValidComponent = "div"> =
	TextFieldPrimitive.TextFieldRootProps<T> & {
		class?: string | undefined;
	};

const TextField = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, TextFieldRootProps<T>>,
) => {
	const [local, others] = splitProps(props as TextFieldRootProps, ["class"]);
	return (
		<TextFieldPrimitive.Root
			class={cn("flex flex-col gap-1", local.class)}
			{...others}
		/>
	);
};

type TextFieldInputProps<T extends ValidComponent = "input"> =
	TextFieldPrimitive.TextFieldInputProps<T> & {
		class?: string | undefined;
		type?:
			| "button"
			| "checkbox"
			| "color"
			| "date"
			| "datetime-local"
			| "email"
			| "file"
			| "hidden"
			| "image"
			| "month"
			| "number"
			| "password"
			| "radio"
			| "range"
			| "reset"
			| "search"
			| "submit"
			| "tel"
			| "text"
			| "time"
			| "url"
			| "week";
	};

const TextFieldInput = <T extends ValidComponent = "input">(
	rawProps: PolymorphicProps<T, TextFieldInputProps<T>>,
) => {
	const props = mergeProps<TextFieldInputProps<T>[]>(
		{ type: "text" },
		rawProps,
	);
	const [local, others] = splitProps(props as TextFieldInputProps, [
		"type",
		"class",
	]);
	return (
		<TextFieldPrimitive.Input
			type={local.type}
			class={cn(
				"flex h-10 w-full rounded-md border border-outline dark:border-outline-dark bg-transparent px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark placeholder:text-on-surface-subtle dark:placeholder:text-on-surface-dark-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ui-invalid:border-danger ui-invalid:text-danger",
				local.class,
			)}
			{...others}
		/>
	);
};

type TextFieldTextAreaProps<T extends ValidComponent = "textarea"> =
	TextFieldPrimitive.TextFieldTextAreaProps<T> & { class?: string | undefined };

const TextFieldTextArea = <T extends ValidComponent = "textarea">(
	props: PolymorphicProps<T, TextFieldTextAreaProps<T>>,
) => {
	const [local, others] = splitProps(props as TextFieldTextAreaProps, [
		"class",
	]);
	return (
		<TextFieldPrimitive.TextArea
			class={cn(
				"flex min-h-20 w-full rounded-md border border-outline dark:border-outline-dark bg-transparent px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark placeholder:text-on-surface-subtle dark:placeholder:text-on-surface-dark-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ui-invalid:border-danger ui-invalid:text-danger",
				local.class,
			)}
			{...others}
		/>
	);
};

const labelVariants = cva(
	"text-sm font-medium leading-none text-on-surface-strong dark:text-on-surface-dark-strong peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
	{
		variants: {
			variant: {
				label: "",
				description:
					"font-normal text-on-surface-muted dark:text-on-surface-dark-muted",
				error: "text-xs text-danger font-medium",
			},
		},
		defaultVariants: {
			variant: "label",
		},
	},
);

type TextFieldLabelProps<T extends ValidComponent = "label"> =
	TextFieldPrimitive.TextFieldLabelProps<T> & { class?: string | undefined };

const TextFieldLabel = <T extends ValidComponent = "label">(
	props: PolymorphicProps<T, TextFieldLabelProps<T>>,
) => {
	const [local, others] = splitProps(props as TextFieldLabelProps, ["class"]);
	return (
		<TextFieldPrimitive.Label
			class={cn(labelVariants(), local.class)}
			{...others}
		/>
	);
};

type TextFieldDescriptionProps<T extends ValidComponent = "div"> =
	TextFieldPrimitive.TextFieldDescriptionProps<T> & {
		class?: string | undefined;
	};

const TextFieldDescription = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, TextFieldDescriptionProps<T>>,
) => {
	const [local, others] = splitProps(props as TextFieldDescriptionProps, [
		"class",
	]);
	return (
		<TextFieldPrimitive.Description
			class={cn(labelVariants({ variant: "description" }), local.class)}
			{...others}
		/>
	);
};

type TextFieldErrorMessageProps<T extends ValidComponent = "div"> =
	TextFieldPrimitive.TextFieldErrorMessageProps<T> & {
		class?: string | undefined;
	};

const TextFieldErrorMessage = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, TextFieldErrorMessageProps<T>>,
) => {
	const [local, others] = splitProps(props as TextFieldErrorMessageProps, [
		"class",
	]);
	return (
		<TextFieldPrimitive.ErrorMessage
			class={cn(labelVariants({ variant: "error" }), local.class)}
			{...others}
		/>
	);
};

export {
	TextField,
	TextFieldInput,
	TextFieldTextArea,
	TextFieldLabel,
	TextFieldDescription,
	TextFieldErrorMessage,
};
