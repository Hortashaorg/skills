import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Flex } from "./flex";

describe("Flex", () => {
	test("renders children correctly", () => {
		const { getByText } = render(() => (
			<Flex>
				<div>Test Content</div>
			</Flex>
		));
		expect(getByText("Test Content")).toBeInTheDocument();
	});

	test("applies default direction (row)", () => {
		const { container } = render(() => <Flex>Content</Flex>);
		const div = container.querySelector("div");
		expect(div).toHaveClass("flex-row");
	});

	test("applies column direction", () => {
		const { container } = render(() => <Flex direction="column">Content</Flex>);
		const div = container.querySelector("div");
		expect(div).toHaveClass("flex-col");
	});

	test("applies reverse directions", () => {
		const { container: container1 } = render(() => (
			<Flex direction="rowReverse">Content</Flex>
		));
		expect(container1.querySelector("div")).toHaveClass("flex-row-reverse");

		const { container: container2 } = render(() => (
			<Flex direction="columnReverse">Content</Flex>
		));
		expect(container2.querySelector("div")).toHaveClass("flex-col-reverse");
	});

	test("applies align variants", () => {
		const { container: container1 } = render(() => (
			<Flex align="center">Content</Flex>
		));
		expect(container1.querySelector("div")).toHaveClass("items-center");

		const { container: container2 } = render(() => (
			<Flex align="end">Content</Flex>
		));
		expect(container2.querySelector("div")).toHaveClass("items-end");

		const { container: container3 } = render(() => (
			<Flex align="baseline">Content</Flex>
		));
		expect(container3.querySelector("div")).toHaveClass("items-baseline");
	});

	test("applies justify variants", () => {
		const { container: container1 } = render(() => (
			<Flex justify="center">Content</Flex>
		));
		expect(container1.querySelector("div")).toHaveClass("justify-center");

		const { container: container2 } = render(() => (
			<Flex justify="between">Content</Flex>
		));
		expect(container2.querySelector("div")).toHaveClass("justify-between");

		const { container: container3 } = render(() => (
			<Flex justify="evenly">Content</Flex>
		));
		expect(container3.querySelector("div")).toHaveClass("justify-evenly");
	});

	test("applies wrap variants", () => {
		const { container: container1 } = render(() => (
			<Flex wrap="wrap">Content</Flex>
		));
		expect(container1.querySelector("div")).toHaveClass("flex-wrap");

		const { container: container2 } = render(() => (
			<Flex wrap="wrapReverse">Content</Flex>
		));
		expect(container2.querySelector("div")).toHaveClass("flex-wrap-reverse");
	});

	test("applies gap variants", () => {
		const { container: container1 } = render(() => (
			<Flex gap="sm">Content</Flex>
		));
		expect(container1.querySelector("div")).toHaveClass("gap-2");

		const { container: container2 } = render(() => (
			<Flex gap="lg">Content</Flex>
		));
		expect(container2.querySelector("div")).toHaveClass("gap-6");
	});

	test("applies custom class", () => {
		const { container } = render(() => (
			<Flex class="custom-class">Content</Flex>
		));
		const div = container.querySelector("div");
		expect(div).toHaveClass("custom-class");
	});

	test("applies base flex class", () => {
		const { container } = render(() => <Flex>Content</Flex>);
		const div = container.querySelector("div");
		expect(div).toHaveClass("flex");
	});

	test("spreads additional props correctly", () => {
		const { container } = render(() => (
			<Flex data-testid="test-flex">Content</Flex>
		));
		const div = container.querySelector("div");
		expect(div).toHaveAttribute("data-testid", "test-flex");
	});
});
