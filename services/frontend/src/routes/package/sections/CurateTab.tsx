import { queries, useQuery, useZero } from "@package/database/client";
import { createMemo, For, Show } from "solid-js";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface CurateTabProps {
	packageId: string;
}

export const CurateTab = (props: CurateTabProps) => {
	const zero = useZero();
	const isLoggedIn = () => zero().userID !== "anon";

	// Get package with tags
	const [packageWithTags] = useQuery(() =>
		queries.packages.byIdWithTags({ id: props.packageId }),
	);

	// Get all tags for name lookup
	const [allTags] = useQuery(() => queries.tags.list());

	const tagsById = createMemo(() => {
		const all = allTags() ?? [];
		return new Map(all.map((t) => [t.id, t]));
	});

	const packageTags = createMemo(() => packageWithTags()?.packageTags ?? []);

	// Get pending suggestions for this package
	const [suggestions] = useQuery(() =>
		queries.suggestions.pendingForPackage({ packageId: props.packageId }),
	);

	// Helper to get tag name from suggestion payload
	const getTagNameFromPayload = (payload: unknown): string => {
		const p = payload as { tagId?: string };
		if (p?.tagId) {
			return tagsById().get(p.tagId)?.name ?? "Unknown tag";
		}
		return "Unknown";
	};

	return (
		<Stack spacing="lg">
			{/* Current tags */}
			<Card padding="md">
				<Stack spacing="sm">
					<Text weight="semibold">Current Tags</Text>
					<Show
						when={packageTags().length > 0}
						fallback={
							<Text size="sm" color="muted">
								No tags yet
							</Text>
						}
					>
						<div class="flex flex-wrap gap-2">
							<For each={packageTags()}>
								{(pt) => (
									<Badge variant="secondary">
										{tagsById().get(pt.tagId)?.name ?? "Unknown"}
									</Badge>
								)}
							</For>
						</div>
					</Show>
				</Stack>
			</Card>

			{/* Suggest a tag */}
			<Card padding="md">
				<Stack spacing="sm">
					<Text weight="semibold">Suggest a Tag</Text>
					<Show
						when={isLoggedIn()}
						fallback={
							<Text size="sm" color="muted">
								Log in to suggest tags
							</Text>
						}
					>
						<Text size="sm" color="muted">
							Tag suggestion form coming soon...
						</Text>
					</Show>
				</Stack>
			</Card>

			{/* Pending suggestions */}
			<Card padding="md">
				<Stack spacing="sm">
					<Text weight="semibold">Pending Suggestions</Text>
					<Show
						when={suggestions()?.length}
						fallback={
							<Text size="sm" color="muted">
								No pending suggestions
							</Text>
						}
					>
						<For each={suggestions()}>
							{(suggestion) => (
								<div class="flex items-center justify-between p-2 border rounded">
									<div>
										<Text size="sm">
											{suggestion.type === "add_tag" ? "Add tag: " : ""}
											{getTagNameFromPayload(suggestion.payload)}
										</Text>
										<Text size="xs" color="muted">
											by {suggestion.account?.name ?? "Unknown"}
										</Text>
									</div>
									<div class="flex gap-2">
										<Badge variant="info">
											{suggestion.votes?.length ?? 0} votes
										</Badge>
									</div>
								</div>
							)}
						</For>
					</Show>
				</Stack>
			</Card>
		</Stack>
	);
};
