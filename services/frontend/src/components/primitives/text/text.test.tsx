import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Text } from "./text";

describe("Text", () => {
	test("renders children correctly", () => {
		const { getByText } = render(() => <Text>Test Content</Text>);
		expect(getByText("Test Content")).toBeInTheDocument();
	});

	test("renders as p element by default", () => {
		const { container } = render(() => <Text>Content</Text>);
		expect(container.querySelector("p")).toBeInTheDocument();
	});

	test("renders as specified element", () => {
		const { container: container1 } = render(() => (
			<Text as="span">Content</Text>
		));
		expect(container1.querySelector("span")).toBeInTheDocument();

		const { container: container2 } = render(() => (
			<Text as="div">Content</Text>
		));
		expect(container2.querySelector("div")).toBeInTheDocument();
	});

	test("applies default size (base)", () => {
		const { container } = render(() => <Text>Content</Text>);
		const element = container.querySelector("p");
		expect(element).toHaveClass("text-base");
	});

	test("applies size variants", () => {
		const { container: container1 } = render(() => (
			<Text size="xs">Content</Text>
		));
		expect(container1.querySelector("p")).toHaveClass("text-xs");

		const { container: container2 } = render(() => (
			<Text size="sm">Content</Text>
		));
		expect(container2.querySelector("p")).toHaveClass("text-sm");

		const { container: container3 } = render(() => (
			<Text size="lg">Content</Text>
		));
		expect(container3.querySelector("p")).toHaveClass("text-lg");
	});

	test("applies weight variants", () => {
		const { container: container1 } = render(() => (
			<Text weight="medium">Content</Text>
		));
		expect(container1.querySelector("p")).toHaveClass("font-medium");

		const { container: container2 } = render(() => (
			<Text weight="bold">Content</Text>
		));
		expect(container2.querySelector("p")).toHaveClass("font-bold");
	});

	test("applies color variants", () => {
		const { container: container1 } = render(() => (
			<Text color="primary">Content</Text>
		));
		expect(container1.querySelector("p")).toHaveClass("text-primary");

		const { container: container2 } = render(() => (
			<Text color="danger">Content</Text>
		));
		expect(container2.querySelector("p")).toHaveClass("text-danger");

		const { container: container3 } = render(() => (
			<Text color="muted">Content</Text>
		));
		expect(container3.querySelector("p")).toHaveClass("text-on-surface/70");
	});

	test("applies custom class", () => {
		const { container } = render(() => (
			<Text class="custom-class">Content</Text>
		));
		const element = container.querySelector("p");
		expect(element).toHaveClass("custom-class");
	});

	test("spreads additional props correctly", () => {
		const { container } = render(() => (
			<Text data-testid="test-text">Content</Text>
		));
		const element = container.querySelector("p");
		expect(element).toHaveAttribute("data-testid", "test-text");
	});

	test("combines multiple variants", () => {
		const { container } = render(() => (
			<Text size="lg" weight="bold" color="primary">
				Content
			</Text>
		));
		const element = container.querySelector("p");
		expect(element).toHaveClass("text-lg");
		expect(element).toHaveClass("font-bold");
		expect(element).toHaveClass("text-primary");
	});
});
