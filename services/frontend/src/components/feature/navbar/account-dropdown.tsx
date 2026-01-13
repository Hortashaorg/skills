import { createMemo, For, Show } from "solid-js";
import { ChevronDownIcon, UserIcon } from "@/components/primitives/icon";
import { Dropdown } from "@/components/ui/dropdown";
import type { NavItem } from "./types";

const iconButtonClass =
	"p-2 rounded-full text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition cursor-pointer";

export type AccountDropdownProps = {
	navItems: NavItem[];
	userRoles: string[];
	currentPath: string;
	onLogout: () => void;
};

export const AccountDropdown = (props: AccountDropdownProps) => {
	const isActive = (item: NavItem) => {
		if (item.exactMatch) {
			return props.currentPath === item.href;
		}
		return props.currentPath.startsWith(item.href);
	};

	const filteredItems = createMemo(() =>
		props.navItems.filter((item) => {
			if (!item.roles || item.roles.length === 0) return true;
			return item.roles.some((role) => props.userRoles.includes(role));
		}),
	);

	const regularItems = createMemo(() =>
		filteredItems().filter((item) => !item.roles || item.roles.length === 0),
	);

	const adminItems = createMemo(() =>
		filteredItems().filter((item) => item.roles && item.roles.length > 0),
	);

	return (
		<Dropdown>
			<Dropdown.Trigger
				aria-label="Account menu"
				class={`flex items-center gap-0.5 ${iconButtonClass}`}
			>
				<UserIcon size="sm" />
				<ChevronDownIcon size="xs" />
			</Dropdown.Trigger>
			<Dropdown.Content width="sm">
				<For each={regularItems()}>
					{(item) => (
						<Dropdown.LinkItem href={item.href} active={isActive(item)}>
							{item.label}
						</Dropdown.LinkItem>
					)}
				</For>
				<Show when={adminItems().length > 0}>
					<Dropdown.Separator />
					<For each={adminItems()}>
						{(item) => (
							<Dropdown.LinkItem href={item.href} active={isActive(item)}>
								{item.label}
							</Dropdown.LinkItem>
						)}
					</For>
				</Show>
				<Dropdown.Separator />
				<Dropdown.Item onSelect={props.onLogout}>Sign out</Dropdown.Item>
			</Dropdown.Content>
		</Dropdown>
	);
};
