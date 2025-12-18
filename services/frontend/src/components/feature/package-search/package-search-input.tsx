import { For, Show } from "solid-js";
import {
	TextField,
	TextFieldInput,
	TextFieldLabel,
} from "@/components/ui/text-field";

export type PackageRegistry = "npm" | "jsr" | "brew" | "apt";

export interface PackageResult {
	id: string;
	name: string;
	registry: PackageRegistry;
	description?: string | null;
	homepage?: string | null;
	repository?: string | null;
}

export interface PackageSearchInputProps {
	/** Controlled search value */
	value: string;
	/** Called when user types */
	onValueChange: (value: string) => void;
	/** Results to display in dropdown */
	results: PackageResult[];
	/** Show loading spinner */
	isLoading?: boolean;
	/** Called when user selects a package */
	onPackageSelect?: (pkg: PackageResult) => void;
	/** Called when user clears search */
	onClear?: () => void;
	/** UI customization */
	placeholder?: string;
	label?: string;
	class?: string;
}

export const PackageSearchInput = (props: PackageSearchInputProps) => {
	const handleClear = () => {
		props.onValueChange("");
		props.onClear?.();
	};

	return (
		<div class="relative">
			<TextField class={props.class}>
				<Show when={props.label}>
					<TextFieldLabel>{props.label}</TextFieldLabel>
				</Show>
				<div class="relative">
					<div class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-subtle dark:text-on-surface-dark-subtle">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<title>Search</title>
							<circle cx="11" cy="11" r="8" />
							<path d="m21 21-4.35-4.35" />
						</svg>
					</div>

					<TextFieldInput
						type="search"
						value={props.value}
						onInput={(e) => props.onValueChange(e.currentTarget.value)}
						placeholder={props.placeholder || "Search packages..."}
						class="pl-9 pr-20"
					/>

					<div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
						<Show when={props.isLoading}>
							<div class="text-on-surface-subtle dark:text-on-surface-dark-subtle">
								<svg
									class="animate-spin"
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<title>Loading</title>
									<path d="M21 12a9 9 0 1 1-6.219-8.56" />
								</svg>
							</div>
						</Show>

						<Show when={props.value}>
							<button
								type="button"
								onClick={handleClear}
								class="text-on-surface-subtle dark:text-on-surface-dark-subtle hover:text-on-surface dark:hover:text-on-surface-dark transition-colors"
								aria-label="Clear search"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<title>Clear</title>
									<circle cx="12" cy="12" r="10" />
									<path d="m15 9-6 6" />
									<path d="m9 9 6 6" />
								</svg>
							</button>
						</Show>
					</div>
				</div>
			</TextField>

			{/* Results Dropdown */}
			<Show when={props.value && props.results.length > 0}>
				<div class="absolute z-50 w-full mt-1 bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-md shadow-lg max-h-60 overflow-y-auto">
					<For each={props.results}>
						{(pkg) => (
							<button
								type="button"
								onClick={() => props.onPackageSelect?.(pkg)}
								class="w-full text-left px-4 py-3 hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition-colors border-b border-outline/50 dark:border-outline-dark/50 last:border-b-0"
							>
								<div class="flex items-start justify-between gap-2">
									<div class="flex-1 min-w-0">
										<div class="font-semibold text-on-surface dark:text-on-surface-dark">
											{pkg.name}
										</div>
										<Show when={pkg.description}>
											<div class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted truncate">
												{pkg.description}
											</div>
										</Show>
									</div>
									<div class="shrink-0">
										<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark">
											{pkg.registry}
										</span>
									</div>
								</div>
							</button>
						)}
					</For>
				</div>
			</Show>

			{/* No Results Message */}
			<Show
				when={props.value && props.results.length === 0 && !props.isLoading}
			>
				<div class="absolute z-50 w-full mt-1 bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-md shadow-lg p-4 text-center">
					<div class="text-on-surface-muted dark:text-on-surface-dark-muted">
						No packages found for "{props.value}"
					</div>
				</div>
			</Show>
		</div>
	);
};
