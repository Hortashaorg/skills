import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Container } from "./container";

describe("Container", () => {
	test("renders children correctly", () => {
		const { getByText } = render(() => (
			<Container>
				<div>Test Content</div>
			</Container>
		));
		expect(getByText("Test Content")).toBeInTheDocument();
	});

	test("applies default size (lg)", () => {
		const { container } = render(() => <Container>Content</Container>);
		const div = container.querySelector("div");
		expect(div).toHaveClass("max-w-7xl");
	});

	test("applies sm size", () => {
		const { container } = render(() => (
			<Container size="sm">Content</Container>
		));
		const div = container.querySelector("div");
		expect(div).toHaveClass("max-w-3xl");
	});

	test("applies md size", () => {
		const { container } = render(() => (
			<Container size="md">Content</Container>
		));
		const div = container.querySelector("div");
		expect(div).toHaveClass("max-w-5xl");
	});

	test("applies xl size", () => {
		const { container } = render(() => (
			<Container size="xl">Content</Container>
		));
		const div = container.querySelector("div");
		expect(div).toHaveClass("max-w-350");
	});

	test("applies full size", () => {
		const { container } = render(() => (
			<Container size="full">Content</Container>
		));
		const div = container.querySelector("div");
		expect(div).toHaveClass("max-w-full");
	});

	test("applies custom class", () => {
		const { container } = render(() => (
			<Container class="custom-class">Content</Container>
		));
		const div = container.querySelector("div");
		expect(div).toHaveClass("custom-class");
	});

	test("applies base classes", () => {
		const { container } = render(() => <Container>Content</Container>);
		const div = container.querySelector("div");
		expect(div).toHaveClass("mx-auto");
		expect(div).toHaveClass("px-4");
	});

	test("spreads additional props correctly", () => {
		const { container } = render(() => (
			<Container data-testid="test-container">Content</Container>
		));
		const div = container.querySelector("div");
		expect(div).toHaveAttribute("data-testid", "test-container");
	});
});
