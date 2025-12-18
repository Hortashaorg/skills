import {
	Toast as ToastPrimitive,
	type ToastRootProps,
	toaster,
} from "@kobalte/core/toast";
import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const toastVariants = cva(
	[
		"group",
		"pointer-events-auto",
		"relative",
		"flex",
		"w-full",
		"items-center",
		"justify-between",
		"space-x-4",
		"overflow-hidden",
		"rounded-radius",
		"border",
		"p-4",
		"shadow-lg",
		"transition-all",
		"data-[swipe=cancel]:translate-x-0",
		"data-[swipe=end]:translate-x-(--kb-toast-swipe-end-x)",
		"data-[swipe=move]:translate-x-(--kb-toast-swipe-move-x)",
		"data-[swipe=move]:transition-none",
		"ui-opened:animate-in",
		"ui-closed:animate-out",
		"data-[swipe=end]:animate-out",
		"ui-closed:fade-out-80",
		"ui-closed:slide-out-to-right-full",
		"ui-opened:slide-in-from-top-full",
		"ui-opened:sm:slide-in-from-bottom-full",
	],
	{
		variants: {
			variant: {
				success: [
					"bg-success",
					"border-success",
					"text-on-success",
					"dark:bg-success",
					"dark:border-success",
					"dark:text-on-success",
				],
				error: [
					"bg-danger",
					"border-danger",
					"text-on-danger",
					"dark:bg-danger",
					"dark:border-danger",
					"dark:text-on-danger",
				],
				info: [
					"bg-info",
					"border-info",
					"text-on-info",
					"dark:bg-info",
					"dark:border-info",
					"dark:text-on-info",
				],
				warning: [
					"bg-warning",
					"border-warning",
					"text-on-warning",
					"dark:bg-warning",
					"dark:border-warning",
					"dark:text-on-warning",
				],
			},
		},
		defaultVariants: {
			variant: "info",
		},
	},
);

type ToastVariantProps = VariantProps<typeof toastVariants>;

export type ToastProps = ToastRootProps &
	ToastVariantProps & {
		class?: string;
		children?: JSX.Element;
	};

export const ToastRoot = (props: ToastProps) => {
	const [local, others] = splitProps(props, ["variant", "class", "children"]);

	return (
		<ToastPrimitive
			class={cn(toastVariants({ variant: local.variant }), local.class)}
			{...others}
		>
			{props.children}
		</ToastPrimitive>
	);
};

export const ToastTitle = (props: JSX.IntrinsicElements["div"]) => {
	return (
		<ToastPrimitive.Title
			class={cn("text-sm font-semibold", props.class)}
			{...props}
		/>
	);
};

export const ToastDescription = (props: JSX.IntrinsicElements["div"]) => {
	return (
		<ToastPrimitive.Description
			class={cn("text-sm opacity-90", props.class)}
			{...props}
		/>
	);
};

export const ToastCloseButton = (props: JSX.IntrinsicElements["button"]) => {
	return (
		<ToastPrimitive.CloseButton
			class={cn(
				"absolute",
				"right-2",
				"top-2",
				"rounded-sm",
				"opacity-70",
				"transition-opacity",
				"hover:opacity-100",
				"focus:outline-none",
				"focus:ring-2",
				"disabled:pointer-events-none",
				props.class,
			)}
			{...props}
		>
			<span class="sr-only">Close</span>
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
				<title>Close</title>
				<path d="M18 6 6 18" />
				<path d="m6 6 12 12" />
			</svg>
		</ToastPrimitive.CloseButton>
	);
};

export const ToastRegion = (props: { class?: string }) => {
	return (
		<ToastPrimitive.Region
			class={cn(
				"fixed",
				"bottom-0",
				"right-0",
				"z-100",
				"flex",
				"max-h-screen",
				"w-full",
				"flex-col-reverse",
				"p-4",
				"sm:bottom-0",
				"sm:right-0",
				"sm:top-auto",
				"sm:flex-col",
				"md:max-w-105",
				props.class,
			)}
		>
			<ToastPrimitive.List class="flex flex-col gap-2" />
		</ToastPrimitive.Region>
	);
};

// Toast utility functions
export type ToastOptions = {
	title?: string;
	description?: string;
	duration?: number;
	variant?: ToastVariantProps["variant"];
};

function showToast(options: ToastOptions) {
	return toaster.show((props) => (
		<ToastRoot toastId={props.toastId} variant={options.variant}>
			{options.title && <ToastTitle>{options.title}</ToastTitle>}
			{options.description && (
				<ToastDescription>{options.description}</ToastDescription>
			)}
			<ToastCloseButton />
		</ToastRoot>
	));
}

export const toast = {
	success: (message: string, title?: string) =>
		showToast({
			variant: "success",
			title: title || "Success",
			description: message,
			duration: 3000,
		}),
	error: (message: string, title?: string) =>
		showToast({
			variant: "error",
			title: title || "Error",
			description: message,
			duration: 5000,
		}),
	info: (message: string, title?: string) =>
		showToast({
			variant: "info",
			title: title || "Info",
			description: message,
			duration: 3000,
		}),
	warning: (message: string, title?: string) =>
		showToast({
			variant: "warning",
			title: title || "Warning",
			description: message,
			duration: 4000,
		}),
	custom: (options: ToastOptions) => showToast(options),
};

export const Toast = {
	Root: ToastRoot,
	Title: ToastTitle,
	Description: ToastDescription,
	CloseButton: ToastCloseButton,
	Region: ToastRegion,
};
