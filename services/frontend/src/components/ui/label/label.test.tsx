import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Label } from "./label";

describe("Label", () => {
	test("renders children correctly", () => {
		const { getByText } = render(() => <Label>Email address</Label>);
		expect(getByText("Email address")).toBeInTheDocument();
	});

	test("applies custom class", () => {
		const { container } = render(() => (
			<Label class="custom-class">Test Label</Label>
		));
		const label = container.querySelector("label");
		expect(label).toHaveClass("custom-class");
	});

	test("applies default styling classes", () => {
		const { container } = render(() => <Label>Test</Label>);
		const label = container.querySelector("label");
		expect(label).toHaveClass("text-sm");
		expect(label).toHaveClass("font-medium");
		expect(label).toHaveClass("leading-none");
	});

	test("spreads additional props correctly", () => {
		const { container } = render(() => (
			<Label for="test-input" data-testid="test-label">
				Test
			</Label>
		));
		const label = container.querySelector("label");
		expect(label).toHaveAttribute("for", "test-input");
		expect(label).toHaveAttribute("data-testid", "test-label");
	});

	test("renders with htmlFor attribute", () => {
		const { container } = render(() => <Label for="email-input">Email</Label>);
		const label = container.querySelector("label");
		expect(label).toHaveAttribute("for", "email-input");
	});
});
