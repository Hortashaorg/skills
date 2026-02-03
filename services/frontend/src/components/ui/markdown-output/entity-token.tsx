import { Popover } from "@kobalte/core/popover";
import { A } from "@solidjs/router";
import { createSignal, Match, Show, Switch } from "solid-js";
import { Portal } from "solid-js/web";
import { cn } from "@/lib/utils";

export type EntityType = "user" | "project" | "package" | "ecosystem";

export interface EntityData {
	type: EntityType;
	id: string;
	name: string;
	description?: string | null;
	href: string;
	// Package-specific
	registry?: string;
	// User-specific
	memberSince?: string;
}

export interface EntityTokenProps {
	type: EntityType;
	id: string;
	data?: EntityData | null;
	isLoading?: boolean;
}

function getEntityIcon(type: EntityType) {
	switch (type) {
		case "user":
			return "👤";
		case "project":
			return "📁";
		case "package":
			return "📦";
		case "ecosystem":
			return "🌐";
	}
}

function getEntityLabel(type: EntityType) {
	switch (type) {
		case "user":
			return "User";
		case "project":
			return "Project";
		case "package":
			return "Package";
		case "ecosystem":
			return "Ecosystem";
	}
}

export const EntityToken = (props: EntityTokenProps) => {
	const [isOpen, setIsOpen] = createSignal(false);
	let closeTimeout: ReturnType<typeof setTimeout> | null = null;

	const handleMouseEnter = () => {
		if (closeTimeout) {
			clearTimeout(closeTimeout);
			closeTimeout = null;
		}
		setIsOpen(true);
	};

	const handleMouseLeave = () => {
		closeTimeout = setTimeout(() => setIsOpen(false), 150);
	};

	const displayName = () => props.data?.name ?? props.id;
	const href = () => props.data?.href ?? "#";

	return (
		<Popover open={isOpen()} onOpenChange={setIsOpen}>
			<Popover.Anchor
				as="span"
				class="entity-token"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onFocus={handleMouseEnter}
				onBlur={handleMouseLeave}
			>
				<A href={href()} class="entity-token-link">
					<span class="entity-token-icon">{getEntityIcon(props.type)}</span>
					<span class="entity-token-label">{getEntityLabel(props.type)}:</span>
					<span class="entity-token-name">{displayName()}</span>
				</A>
			</Popover.Anchor>
			<Portal>
				<Popover.Content
					class={cn(
						"z-50 w-72",
						"rounded-radius border border-outline dark:border-outline-dark",
						"bg-surface dark:bg-surface-dark shadow-lg",
						"ui-expanded:animate-in ui-expanded:fade-in-0 ui-expanded:zoom-in-95",
						"ui-closed:animate-out ui-closed:fade-out-0 ui-closed:zoom-out-95",
					)}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					<Show
						when={!props.isLoading && props.data}
						fallback={
							<div class="p-4 text-center text-sm text-on-surface-muted dark:text-on-surface-dark-muted">
								{props.isLoading ? "Loading..." : "Not found"}
							</div>
						}
					>
						{(data) => (
							<A
								href={data().href}
								class="block p-4 hover:bg-surface-alt/50 dark:hover:bg-surface-dark-alt/50 transition-colors"
							>
								<div class="flex items-start gap-3">
									<span class="text-2xl">{getEntityIcon(props.type)}</span>
									<div class="flex-1 min-w-0">
										<div class="font-medium text-on-surface dark:text-on-surface-dark truncate">
											{data().name}
										</div>
										<Switch>
											<Match when={props.type === "package" && data().registry}>
												<div class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted">
													{data().registry}
												</div>
											</Match>
											<Match when={props.type === "user" && data().memberSince}>
												<div class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted">
													Member since {data().memberSince}
												</div>
											</Match>
										</Switch>
										<Show when={data().description}>
											<p class="mt-1 text-sm text-on-surface-muted dark:text-on-surface-dark-muted line-clamp-2">
												{data().description}
											</p>
										</Show>
									</div>
								</div>
							</A>
						)}
					</Show>
				</Popover.Content>
			</Portal>
		</Popover>
	);
};
