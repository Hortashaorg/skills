import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Stack } from "./stack";

describe("Stack", () => {
	test("renders children correctly", () => {
		const { getByText } = render(() => (
			<Stack>
				<div>Test Content</div>
			</Stack>
		));
		expect(getByText("Test Content")).toBeInTheDocument();
	});

	test("applies default direction (vertical)", () => {
		const { container } = render(() => <Stack>Content</Stack>);
		const div = container.querySelector("div");
		expect(div).toHaveClass("flex-col");
	});

	test("applies horizontal direction", () => {
		const { container } = render(() => (
			<Stack direction="horizontal">Content</Stack>
		));
		const div = container.querySelector("div");
		expect(div).toHaveClass("flex-row");
	});

	test("applies default spacing (md)", () => {
		const { container } = render(() => <Stack>Content</Stack>);
		const div = container.querySelector("div");
		expect(div).toHaveClass("gap-4");
	});

	test("applies spacing variants", () => {
		const { container: container1 } = render(() => (
			<Stack spacing="xs">Content</Stack>
		));
		expect(container1.querySelector("div")).toHaveClass("gap-1");

		const { container: container2 } = render(() => (
			<Stack spacing="sm">Content</Stack>
		));
		expect(container2.querySelector("div")).toHaveClass("gap-2");

		const { container: container3 } = render(() => (
			<Stack spacing="lg">Content</Stack>
		));
		expect(container3.querySelector("div")).toHaveClass("gap-6");

		const { container: container4 } = render(() => (
			<Stack spacing="xl">Content</Stack>
		));
		expect(container4.querySelector("div")).toHaveClass("gap-8");
	});

	test("applies align variants", () => {
		const { container: container1 } = render(() => (
			<Stack align="center">Content</Stack>
		));
		expect(container1.querySelector("div")).toHaveClass("items-center");

		const { container: container2 } = render(() => (
			<Stack align="end">Content</Stack>
		));
		expect(container2.querySelector("div")).toHaveClass("items-end");

		const { container: container3 } = render(() => (
			<Stack align="start">Content</Stack>
		));
		expect(container3.querySelector("div")).toHaveClass("items-start");
	});

	test("applies custom class", () => {
		const { container } = render(() => (
			<Stack class="custom-class">Content</Stack>
		));
		const div = container.querySelector("div");
		expect(div).toHaveClass("custom-class");
	});

	test("applies base flex class", () => {
		const { container } = render(() => <Stack>Content</Stack>);
		const div = container.querySelector("div");
		expect(div).toHaveClass("flex");
	});

	test("spreads additional props correctly", () => {
		const { container } = render(() => (
			<Stack data-testid="test-stack">Content</Stack>
		));
		const div = container.querySelector("div");
		expect(div).toHaveAttribute("data-testid", "test-stack");
	});
});
