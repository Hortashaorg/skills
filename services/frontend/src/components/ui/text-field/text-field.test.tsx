import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import {
	TextField,
	TextFieldDescription,
	TextFieldErrorMessage,
	TextFieldInput,
	TextFieldLabel,
	TextFieldTextArea,
} from "./text-field";

describe("TextField", () => {
	test("renders TextField root component", () => {
		const { container } = render(() => (
			<TextField>
				<TextFieldInput type="text" />
			</TextField>
		));
		expect(container.querySelector("div")).toBeInTheDocument();
	});

	test("TextFieldInput renders with correct type", () => {
		const { container } = render(() => (
			<TextField>
				<TextFieldInput type="email" />
			</TextField>
		));
		const input = container.querySelector("input");
		expect(input).toHaveAttribute("type", "email");
	});

	test("TextFieldInput defaults to text type", () => {
		const { container } = render(() => (
			<TextField>
				<TextFieldInput />
			</TextField>
		));
		const input = container.querySelector("input");
		expect(input).toHaveAttribute("type", "text");
	});

	test("TextFieldTextArea renders correctly", () => {
		const { container } = render(() => (
			<TextField>
				<TextFieldTextArea placeholder="Enter text..." />
			</TextField>
		));
		const textarea = container.querySelector("textarea");
		expect(textarea).toBeInTheDocument();
		expect(textarea).toHaveAttribute("placeholder", "Enter text...");
	});

	test("TextFieldLabel renders correctly", () => {
		const { getByText } = render(() => (
			<TextField>
				<TextFieldLabel>Email Address</TextFieldLabel>
			</TextField>
		));
		expect(getByText("Email Address")).toBeInTheDocument();
	});

	test("TextFieldDescription renders correctly", () => {
		const { getByText } = render(() => (
			<TextField>
				<TextFieldDescription>Helper text</TextFieldDescription>
			</TextField>
		));
		expect(getByText("Helper text")).toBeInTheDocument();
	});

	test("TextFieldErrorMessage renders correctly", () => {
		const { getByText } = render(() => (
			<TextField validationState="invalid">
				<TextFieldErrorMessage>Error message</TextFieldErrorMessage>
			</TextField>
		));
		expect(getByText("Error message")).toBeInTheDocument();
	});

	test("applies invalid state classes to input", () => {
		const { container } = render(() => (
			<TextField validationState="invalid">
				<TextFieldInput type="text" />
			</TextField>
		));
		const input = container.querySelector("input");
		expect(input).toHaveClass("ui-invalid:border-danger");
	});

	test("applies custom class to input", () => {
		const { container } = render(() => (
			<TextField>
				<TextFieldInput type="text" class="custom-input" />
			</TextField>
		));
		const input = container.querySelector("input");
		expect(input).toHaveClass("custom-input");
	});

	test("TextFieldInput handles disabled state", () => {
		const { container } = render(() => (
			<TextField disabled>
				<TextFieldInput type="text" />
			</TextField>
		));
		const input = container.querySelector("input");
		expect(input).toBeDisabled();
	});

	test("spreads additional props correctly", () => {
		const { container } = render(() => (
			<TextField>
				<TextFieldInput type="text" data-testid="test-input" />
			</TextField>
		));
		const input = container.querySelector("input");
		expect(input).toHaveAttribute("data-testid", "test-input");
	});
});
