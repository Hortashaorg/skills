import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { createMemo, createSignal, For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, type SelectOption } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { getAuthData } from "@/context/app-provider";

type Props = {
	packageId: string;
};

export const PackageTags = (props: Props) => {
	const zero = useZero();
	const isAdmin = () => getAuthData()?.roles?.includes("admin") ?? false;

	const [packageWithTags] = useQuery(() =>
		queries.packages.byIdWithTags({ id: props.packageId }),
	);

	const [allTags] = useQuery(() => queries.tags.list());

	const [selectedTagId, setSelectedTagId] = createSignal<string>();
	const [isAdding, setIsAdding] = createSignal(false);

	const packageTags = createMemo(() => packageWithTags()?.packageTags ?? []);

	const assignedTagIds = createMemo(() => {
		return new Set(packageTags().map((pt) => pt.tagId));
	});

	const tagsById = createMemo(() => {
		const all = allTags() ?? [];
		return new Map(all.map((t) => [t.id, t]));
	});

	const availableTagOptions = createMemo((): SelectOption<string>[] => {
		const all = allTags() ?? [];
		const assigned = assignedTagIds();
		return all
			.filter((t) => !assigned.has(t.id))
			.map((t) => ({ value: t.id, label: t.name }));
	});

	const handleAddTag = async () => {
		const tagId = selectedTagId();
		if (!tagId) return;

		setIsAdding(true);
		try {
			const result = await zero().mutate(
				mutators.packageTags.add({
					packageId: props.packageId,
					tagId,
				}),
			).client;
			if (result.type === "error") {
				throw result.error;
			}
			setSelectedTagId(undefined);
		} catch (err) {
			console.error("Failed to add tag:", err);
			toast.error("Failed to add tag. Please try again.");
		} finally {
			setIsAdding(false);
		}
	};

	const handleRemoveTag = async (packageTagId: string) => {
		try {
			const result = await zero().mutate(
				mutators.packageTags.remove({ id: packageTagId }),
			).client;
			if (result.type === "error") {
				throw result.error;
			}
		} catch (err) {
			console.error("Failed to remove tag:", err);
			toast.error("Failed to remove tag. Please try again.");
		}
	};

	const hasTags = createMemo(() => packageTags().length > 0);
	const shouldShow = () => hasTags() || isAdmin();

	return (
		<Show when={shouldShow()}>
			<Flex align="center" wrap="wrap" gap="sm">
				<For each={packageTags()}>
					{(pt) => (
						<Badge variant="secondary">
							<Flex align="center" gap="xs">
								<span>{tagsById().get(pt.tagId)?.name ?? "Unknown"}</span>
								<Show when={isAdmin()}>
									<button
										type="button"
										onClick={() => handleRemoveTag(pt.id)}
										class="ml-1 hover:text-error-600 dark:hover:text-error-400 transition-colors"
										aria-label="Remove tag"
									>
										×
									</button>
								</Show>
							</Flex>
						</Badge>
					)}
				</For>

				<Show when={isAdmin() && availableTagOptions().length > 0}>
					<Flex align="center" gap="xs">
						<Select
							options={availableTagOptions()}
							value={selectedTagId()}
							onChange={setSelectedTagId}
							placeholder="Add tag..."
							size="sm"
						/>
						<Button
							size="sm"
							variant="secondary"
							onClick={handleAddTag}
							disabled={!selectedTagId() || isAdding()}
						>
							{isAdding() ? "Adding..." : "Add"}
						</Button>
					</Flex>
				</Show>
			</Flex>
		</Show>
	);
};
