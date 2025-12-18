import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import {
	Toast,
	ToastCloseButton,
	ToastDescription,
	ToastRegion,
	ToastRoot,
	ToastTitle,
} from "./toast";

describe("Toast Components", () => {
	test("ToastRoot renders with default variant", () => {
		const { container } = render(() => (
			<ToastRoot toastId={1}>Test toast</ToastRoot>
		));
		const toast = container.querySelector("li");
		expect(toast).toBeInTheDocument();
	});

	test("ToastRoot applies variant classes", () => {
		const { container } = render(() => (
			<ToastRoot toastId={1} variant="success">
				Success toast
			</ToastRoot>
		));
		const toast = container.querySelector("li");
		expect(toast).toHaveClass("bg-success");
		expect(toast).toHaveClass("border-success");
	});

	test("ToastRoot applies custom class", () => {
		const { container } = render(() => (
			<ToastRoot toastId={1} class="custom-class">
				Custom toast
			</ToastRoot>
		));
		const toast = container.querySelector("li");
		expect(toast).toHaveClass("custom-class");
	});

	test("ToastTitle renders text", () => {
		const { getByText } = render(() => <ToastTitle>Toast Title</ToastTitle>);
		expect(getByText("Toast Title")).toBeInTheDocument();
	});

	test("ToastDescription renders text", () => {
		const { getByText } = render(() => (
			<ToastDescription>Toast Description</ToastDescription>
		));
		expect(getByText("Toast Description")).toBeInTheDocument();
	});

	test("ToastCloseButton renders with accessible label", () => {
		const { getByRole } = render(() => <ToastCloseButton />);
		const button = getByRole("button");
		expect(button).toBeInTheDocument();
		expect(button).toHaveAttribute("aria-label", "Close");
	});

	test("ToastRegion renders", () => {
		const { container } = render(() => <ToastRegion />);
		const region = container.querySelector("div");
		expect(region).toBeInTheDocument();
		expect(region).toHaveClass("fixed");
		expect(region).toHaveClass("bottom-0");
		expect(region).toHaveClass("right-0");
	});

	test("Toast object exports all components", () => {
		expect(Toast.Root).toBe(ToastRoot);
		expect(Toast.Title).toBe(ToastTitle);
		expect(Toast.Description).toBe(ToastDescription);
		expect(Toast.CloseButton).toBe(ToastCloseButton);
		expect(Toast.Region).toBe(ToastRegion);
	});

	test("ToastRoot renders children", () => {
		const { getByText } = render(() => (
			<ToastRoot toastId={1}>
				<ToastTitle>Title</ToastTitle>
				<ToastDescription>Description</ToastDescription>
			</ToastRoot>
		));
		expect(getByText("Title")).toBeInTheDocument();
		expect(getByText("Description")).toBeInTheDocument();
	});

	test("ToastRoot applies all variant styles correctly", () => {
		const variants = ["success", "error", "info", "warning"] as const;

		for (const variant of variants) {
			const { container } = render(() => (
				<ToastRoot toastId={1} variant={variant}>
					{variant} toast
				</ToastRoot>
			));
			const toast = container.querySelector("li");

			// Each variant should have specific bg and border classes
			if (variant === "error") {
				expect(toast).toHaveClass("bg-danger");
				expect(toast).toHaveClass("border-danger");
			} else {
				expect(toast).toHaveClass(`bg-${variant}`);
				expect(toast).toHaveClass(`border-${variant}`);
			}
		}
	});
});
