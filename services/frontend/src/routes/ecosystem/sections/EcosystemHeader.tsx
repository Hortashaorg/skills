import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { EditableField } from "@/components/composite/editable-field";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { ExternalLinkIcon, PlusIcon } from "@/components/primitives/icon";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface EcosystemHeaderProps {
	name: string;
	description?: string | null;
	website?: string | null;
	tags: readonly { name: string; slug: string }[];
	upvoteCount: number;
	hasUpvoted: boolean;
	isLoggedIn: boolean;
	onUpvote: () => void;
	onAddTag: () => void;
	onEditDescription?: () => void;
}

export const EcosystemHeader = (props: EcosystemHeaderProps) => {
	return (
		<Stack spacing="md">
			<Flex justify="between" align="start" wrap="wrap" gap="md">
				<Stack spacing="sm" class="flex-1 min-w-0">
					<Heading level="h1">{props.name}</Heading>

					<Show when={props.description}>
						<Show
							when={props.onEditDescription}
							fallback={
								<Text color="muted" class="max-w-prose">
									{props.description}
								</Text>
							}
						>
							{(onEdit) => (
								<EditableField onEdit={onEdit()}>
									<Text color="muted" class="max-w-prose">
										{props.description}
									</Text>
								</EditableField>
							)}
						</Show>
					</Show>

					<Show when={props.website} keyed>
						{(website) => (
							<a
								href={website}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1 text-sm text-primary dark:text-primary-dark hover:underline"
							>
								<ExternalLinkIcon size="xs" />
								{website.replace(/^https?:\/\//, "")}
							</a>
						)}
					</Show>

					<Flex gap="xs" wrap="wrap" align="center">
						<For each={props.tags}>
							{(tag) => (
								<A href={`/ecosystems?tags=${tag.slug}`}>
									<Badge variant="secondary" size="sm">
										{tag.name}
									</Badge>
								</A>
							)}
						</For>
						<button
							type="button"
							onClick={props.onAddTag}
							class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border border-dashed border-outline hover:border-primary hover:text-primary dark:border-outline-dark dark:hover:border-primary-dark dark:hover:text-primary-dark transition-colors"
						>
							<PlusIcon size="xs" />
							<span>Add tag</span>
						</button>
					</Flex>
				</Stack>

				<Flex gap="sm" align="center" class="shrink-0">
					<Text size="sm" color="muted">
						{props.upvoteCount} upvotes
					</Text>
					<Show when={props.isLoggedIn}>
						<Button
							variant={props.hasUpvoted ? "primary" : "outline"}
							size="sm"
							onClick={props.onUpvote}
						>
							{props.hasUpvoted ? "Upvoted" : "Upvote"}
						</Button>
					</Show>
				</Flex>
			</Flex>
		</Stack>
	);
};
