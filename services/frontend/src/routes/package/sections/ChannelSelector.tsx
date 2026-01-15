import { formatShortDate } from "@package/common";
import type { Row } from "@package/database/client";
import { For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";

type ReleaseChannel = Row["packageReleaseChannels"];

export interface ChannelSelectorProps {
	channels: readonly ReleaseChannel[];
	selectedChannel: ReleaseChannel | null;
	onChannelChange: (channelId: string) => void;
}

export const ChannelSelector = (props: ChannelSelectorProps) => {
	return (
		<Stack spacing="sm">
			<Flex justify="between" align="center">
				<Heading level="h3">Release Channels</Heading>
				<Text size="xs" color="muted">
					{props.channels.length}{" "}
					{props.channels.length === 1 ? "channel" : "channels"}
				</Text>
			</Flex>

			<Flex gap="sm" wrap="wrap">
				<For each={props.channels}>
					{(channel) => {
						const isSelected = () => props.selectedChannel?.id === channel.id;
						return (
							<button
								type="button"
								onClick={() => props.onChannelChange(channel.id)}
								class={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-radius text-sm font-medium transition-colors cursor-pointer border ${
									isSelected()
										? "bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark border-primary dark:border-primary-dark"
										: "bg-surface-alt dark:bg-surface-dark-alt text-on-surface dark:text-on-surface-dark border-outline dark:border-outline-dark hover:bg-surface dark:hover:bg-surface-dark"
								}`}
							>
								<span class="text-xs opacity-70">{channel.channel}:</span>
								<span>{channel.version}</span>
							</button>
						);
					}}
				</For>
			</Flex>

			<Show when={props.selectedChannel}>
				{(channel) => (
					<Text size="xs" color="muted">
						Published: {formatShortDate(channel().publishedAt)}
					</Text>
				)}
			</Show>
		</Stack>
	);
};
