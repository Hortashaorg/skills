import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Heading } from "./heading";

describe("Heading", () => {
	test("renders children correctly", () => {
		const { getByText } = render(() => <Heading>Test Heading</Heading>);
		expect(getByText("Test Heading")).toBeInTheDocument();
	});

	test("renders as h2 by default", () => {
		const { container } = render(() => <Heading>Content</Heading>);
		expect(container.querySelector("h2")).toBeInTheDocument();
	});

	test("renders as specified heading element", () => {
		const { container: container1 } = render(() => (
			<Heading as="h1">Content</Heading>
		));
		expect(container1.querySelector("h1")).toBeInTheDocument();

		const { container: container3 } = render(() => (
			<Heading as="h3">Content</Heading>
		));
		expect(container3.querySelector("h3")).toBeInTheDocument();

		const { container: container6 } = render(() => (
			<Heading as="h6">Content</Heading>
		));
		expect(container6.querySelector("h6")).toBeInTheDocument();
	});

	test("applies level styling", () => {
		const { container: container1 } = render(() => (
			<Heading level="h1">Content</Heading>
		));
		expect(container1.querySelector("h1")).toHaveClass("text-4xl");

		const { container: container2 } = render(() => (
			<Heading level="h2">Content</Heading>
		));
		expect(container2.querySelector("h2")).toHaveClass("text-3xl");

		const { container: container3 } = render(() => (
			<Heading level="h3">Content</Heading>
		));
		expect(container3.querySelector("h3")).toHaveClass("text-2xl");
	});

	test("applies color variants", () => {
		const { container: container1 } = render(() => (
			<Heading color="default">Content</Heading>
		));
		expect(container1.querySelector("h2")).toHaveClass(
			"text-on-surface-strong",
		);

		const { container: container2 } = render(() => (
			<Heading color="primary">Content</Heading>
		));
		expect(container2.querySelector("h2")).toHaveClass("text-primary");

		const { container: container3 } = render(() => (
			<Heading color="muted">Content</Heading>
		));
		expect(container3.querySelector("h2")).toHaveClass("text-on-surface");
	});

	test("applies base classes", () => {
		const { container } = render(() => <Heading>Content</Heading>);
		const element = container.querySelector("h2");
		expect(element).toHaveClass("font-title");
		expect(element).toHaveClass("font-semibold");
	});

	test("applies custom class", () => {
		const { container } = render(() => (
			<Heading class="custom-class">Content</Heading>
		));
		const element = container.querySelector("h2");
		expect(element).toHaveClass("custom-class");
	});

	test("spreads additional props correctly", () => {
		const { container } = render(() => (
			<Heading data-testid="test-heading">Content</Heading>
		));
		const element = container.querySelector("h2");
		expect(element).toHaveAttribute("data-testid", "test-heading");
	});

	test("semantic element differs from visual styling", () => {
		const { container } = render(() => (
			<Heading as="h3" level="h1">
				Content
			</Heading>
		));
		const h3 = container.querySelector("h3");
		expect(h3).toBeInTheDocument();
		expect(h3).toHaveClass("text-4xl");
	});
});
