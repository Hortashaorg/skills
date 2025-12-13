import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Button } from "./button";

describe("Button", () => {
	test("renders children", () => {
		render(() => <Button>Click me</Button>);
		expect(screen.getByRole("button")).toHaveTextContent("Click me");
	});

	test("applies primary variant by default", () => {
		const { container } = render(() => <Button>Test</Button>);
		const button = container.querySelector("button");
		expect(button).toHaveClass("bg-primary");
	});

	test("applies secondary variant classes", () => {
		const { container } = render(() => (
			<Button variant="secondary">Test</Button>
		));
		const button = container.querySelector("button");
		expect(button).toHaveClass("bg-secondary");
	});

	test("applies danger variant classes", () => {
		const { container } = render(() => <Button variant="danger">Test</Button>);
		const button = container.querySelector("button");
		expect(button).toHaveClass("bg-danger");
	});

	test("applies small size classes", () => {
		const { container } = render(() => <Button size="sm">Test</Button>);
		const button = container.querySelector("button");
		expect(button).toHaveClass("text-xs");
	});

	test("applies large size classes", () => {
		const { container } = render(() => <Button size="lg">Test</Button>);
		const button = container.querySelector("button");
		expect(button).toHaveClass("text-base");
	});

	test("accepts custom classes", () => {
		const { container } = render(() => (
			<Button class="custom-class">Test</Button>
		));
		const button = container.querySelector("button");
		expect(button).toHaveClass("custom-class");
	});

	test("handles click events", () => {
		let clicked = false;
		render(() => (
			<Button
				onClick={() => {
					clicked = true;
				}}
			>
				Click
			</Button>
		));
		screen.getByText("Click").click();
		expect(clicked).toBe(true);
	});

	test("can be disabled", () => {
		render(() => <Button disabled>Disabled</Button>);
		const button = screen.getByText("Disabled");
		expect(button).toBeDisabled();
	});
});
