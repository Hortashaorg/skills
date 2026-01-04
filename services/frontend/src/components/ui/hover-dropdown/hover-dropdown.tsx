import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "@/lib/utils";

export type HoverDropdownProps = {
	trigger: JSX.Element;
	children: JSX.Element;
	align?: "left" | "right";
	width?: "auto" | "sm" | "md" | "lg";
	class?: string;
};

const widthClasses = {
	auto: "",
	sm: "w-44",
	md: "w-64",
	lg: "w-80",
};

export const HoverDropdown = (props: HoverDropdownProps) => {
	const [local, others] = splitProps(props, [
		"trigger",
		"children",
		"align",
		"width",
		"class",
	]);

	const align = () => local.align ?? "right";
	const width = () => local.width ?? "auto";

	return (
		<div class={cn("relative group", local.class)} {...others}>
			{local.trigger}
			<div
				class={cn(
					"absolute top-full hidden group-hover:block z-50 p-2",
					align() === "right" ? "-right-2" : "-left-2",
				)}
			>
				<div
					class={cn(
						"bg-surface dark:bg-surface-dark",
						"border border-outline dark:border-outline-dark",
						"rounded-md shadow-lg",
						widthClasses[width()],
					)}
				>
					{local.children}
				</div>
			</div>
		</div>
	);
};
