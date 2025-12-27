import { createMemo, createSignal } from "solid-js";
import type { Registry } from "@/lib/registries";

interface UsePackageRequestOptions {
	searchValue: () => string;
	registryFilter: () => Registry | "all";
	packages: () => readonly { name: string; registry: string }[] | undefined;
}

/**
 * Hook to manage package request state and logic.
 * Handles tracking requested packages and determining when to show the request form.
 */
export const usePackageRequest = (options: UsePackageRequestOptions) => {
	const [requestRegistry, setRequestRegistry] = createSignal<Registry>("npm");
	const [requestedPackages, setRequestedPackages] = createSignal<
		Map<string, string>
	>(new Map());

	// Determine which registry to use for the request
	const effectiveRegistry = createMemo((): Registry => {
		const filter = options.registryFilter();
		if (filter !== "all") return filter;
		return requestRegistry();
	});

	// Check if the exact search term exists in packages
	const exactMatchExists = createMemo(() => {
		const query = options.searchValue().toLowerCase().trim();
		if (!query) return false;

		const allPackages = options.packages() || [];
		const registry = options.registryFilter();

		return allPackages.some((pkg) => {
			const nameMatches = pkg.name.toLowerCase() === query;
			const registryMatches = registry === "all" || pkg.registry === registry;
			return nameMatches && registryMatches;
		});
	});

	// Check if current search has already been requested
	const isRequested = createMemo(() => {
		const packageName = options.searchValue().trim();
		const registry = effectiveRegistry();
		const key = `${packageName.toLowerCase()}:${registry}`;
		return requestedPackages().has(key);
	});

	// Mark a package as requested
	const markRequested = () => {
		const packageName = options.searchValue().trim();
		const registry = effectiveRegistry();
		const key = `${packageName.toLowerCase()}:${registry}`;
		setRequestedPackages((prev) => {
			const newMap = new Map(prev);
			newMap.set(key, "pending");
			return newMap;
		});
	};

	return {
		requestRegistry,
		setRequestRegistry,
		effectiveRegistry,
		exactMatchExists,
		isRequested,
		markRequested,
	};
};
