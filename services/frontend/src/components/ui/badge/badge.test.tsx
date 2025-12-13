import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
	test("renders children", () => {
		render(() => <Badge>Test content</Badge>);
		expect(screen.getByText("Test content")).toBeInTheDocument();
	});

	test("applies primary variant by default", () => {
		const { container } = render(() => <Badge>Test</Badge>);
		const badge = container.querySelector("span");
		expect(badge).toHaveClass("bg-primary");
	});

	test("applies secondary variant classes", () => {
		const { container } = render(() => <Badge variant="secondary">Test</Badge>);
		const badge = container.querySelector("span");
		expect(badge).toHaveClass("bg-secondary");
	});

	test("applies success variant classes", () => {
		const { container } = render(() => <Badge variant="success">Test</Badge>);
		const badge = container.querySelector("span");
		expect(badge).toHaveClass("bg-success");
	});

	test("applies danger variant classes", () => {
		const { container } = render(() => <Badge variant="danger">Test</Badge>);
		const badge = container.querySelector("span");
		expect(badge).toHaveClass("bg-danger");
	});

	test("applies warning variant classes", () => {
		const { container } = render(() => <Badge variant="warning">Test</Badge>);
		const badge = container.querySelector("span");
		expect(badge).toHaveClass("bg-warning");
	});

	test("applies info variant classes", () => {
		const { container } = render(() => <Badge variant="info">Test</Badge>);
		const badge = container.querySelector("span");
		expect(badge).toHaveClass("bg-info");
	});

	test("applies small size classes", () => {
		const { container } = render(() => <Badge size="sm">Test</Badge>);
		const badge = container.querySelector("span");
		expect(badge).toHaveClass("text-xs");
	});

	test("applies medium size classes", () => {
		const { container } = render(() => <Badge size="md">Test</Badge>);
		const badge = container.querySelector("span");
		expect(badge).toHaveClass("text-sm");
	});

	test("accepts custom classes", () => {
		const { container } = render(() => (
			<Badge class="custom-class">Test</Badge>
		));
		const badge = container.querySelector("span");
		expect(badge).toHaveClass("custom-class");
	});
});
