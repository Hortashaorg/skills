import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { PackageSearchInput } from "./package-search-input";

const mockPackages = [
	{
		id: "1",
		name: "express",
		registry: "npm" as const,
		description: "Fast web framework",
		homepage: null,
		repository: null,
	},
	{
		id: "2",
		name: "react",
		registry: "npm" as const,
		description: "UI library",
		homepage: null,
		repository: null,
	},
];

describe("PackageSearchInput", () => {
	test("renders with placeholder", () => {
		render(() => (
			<PackageSearchInput
				value=""
				onValueChange={() => {}}
				results={[]}
				placeholder="Search packages..."
			/>
		));
		expect(
			screen.getByPlaceholderText("Search packages..."),
		).toBeInTheDocument();
	});

	test("renders with label when provided", () => {
		render(() => (
			<PackageSearchInput
				value=""
				onValueChange={() => {}}
				results={[]}
				label="Package Search"
			/>
		));
		expect(screen.getByText("Package Search")).toBeInTheDocument();
	});

	test("renders search icon", () => {
		const { container } = render(() => (
			<PackageSearchInput value="" onValueChange={() => {}} results={[]} />
		));
		const searchIcons = container.querySelectorAll("svg");
		expect(searchIcons.length).toBeGreaterThan(0);
	});

	test("uses default placeholder when not provided", () => {
		const { container } = render(() => (
			<PackageSearchInput value="" onValueChange={() => {}} results={[]} />
		));
		const input = container.querySelector('input[type="search"]');
		expect(input).toHaveAttribute("placeholder", "Search packages...");
	});

	test("applies custom class", () => {
		const { container } = render(() => (
			<PackageSearchInput
				value=""
				onValueChange={() => {}}
				results={[]}
				class="custom-class"
			/>
		));
		const textField = container.querySelector(".custom-class");
		expect(textField).toBeInTheDocument();
	});

	test("input has correct type attribute", () => {
		const { container } = render(() => (
			<PackageSearchInput value="" onValueChange={() => {}} results={[]} />
		));
		const input = container.querySelector("input");
		expect(input).toHaveAttribute("type", "search");
	});

	test("passes onPackageSelect callback", () => {
		const onPackageSelect = vi.fn();

		const { container } = render(() => (
			<PackageSearchInput
				value=""
				onValueChange={() => {}}
				results={mockPackages}
				onPackageSelect={onPackageSelect}
			/>
		));

		const input = container.querySelector("input");
		expect(input).toBeInTheDocument();
	});

	test("displays controlled value", () => {
		const { container } = render(() => (
			<PackageSearchInput
				value="express"
				onValueChange={() => {}}
				results={[]}
			/>
		));
		const input = container.querySelector("input");
		expect(input).toHaveValue("express");
	});

	test("shows results when provided", () => {
		render(() => (
			<PackageSearchInput
				value="ex"
				onValueChange={() => {}}
				results={mockPackages}
			/>
		));
		expect(screen.getByText("express")).toBeInTheDocument();
		expect(screen.getByText("react")).toBeInTheDocument();
	});

	test("shows loading spinner when isLoading is true", () => {
		const { container } = render(() => (
			<PackageSearchInput
				value="test"
				onValueChange={() => {}}
				results={[]}
				isLoading={true}
			/>
		));
		const loadingSpinner = container.querySelector(".animate-spin");
		expect(loadingSpinner).toBeInTheDocument();
	});
});
