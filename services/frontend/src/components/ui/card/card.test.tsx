import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Card } from "./card";

describe("Card", () => {
	test("renders children correctly", () => {
		const { getByText } = render(() => (
			<Card>
				<div>Test Content</div>
			</Card>
		));
		expect(getByText("Test Content")).toBeInTheDocument();
	});

	test("applies default padding (md)", () => {
		const { container } = render(() => <Card>Content</Card>);
		const div = container.querySelector("div");
		expect(div).toHaveClass("p-4");
	});

	test("applies none padding", () => {
		const { container } = render(() => <Card padding="none">Content</Card>);
		const div = container.querySelector("div");
		expect(div).toHaveClass("p-0");
	});

	test("applies sm padding", () => {
		const { container } = render(() => <Card padding="sm">Content</Card>);
		const div = container.querySelector("div");
		expect(div).toHaveClass("p-3");
	});

	test("applies lg padding", () => {
		const { container } = render(() => <Card padding="lg">Content</Card>);
		const div = container.querySelector("div");
		expect(div).toHaveClass("p-6");
	});

	test("applies base styling classes", () => {
		const { container } = render(() => <Card>Content</Card>);
		const div = container.querySelector("div");
		expect(div).toHaveClass("rounded-radius");
		expect(div).toHaveClass("bg-surface");
		expect(div).toHaveClass("border");
		expect(div).toHaveClass("border-outline");
	});

	test("applies dark mode classes", () => {
		const { container } = render(() => <Card>Content</Card>);
		const div = container.querySelector("div");
		expect(div).toHaveClass("dark:bg-surface-dark");
		expect(div).toHaveClass("dark:border-outline-dark");
	});

	test("applies custom class", () => {
		const { container } = render(() => (
			<Card class="custom-class">Content</Card>
		));
		const div = container.querySelector("div");
		expect(div).toHaveClass("custom-class");
	});

	test("spreads additional props correctly", () => {
		const { container } = render(() => (
			<Card data-testid="test-card">Content</Card>
		));
		const div = container.querySelector("div");
		expect(div).toHaveAttribute("data-testid", "test-card");
	});
});
