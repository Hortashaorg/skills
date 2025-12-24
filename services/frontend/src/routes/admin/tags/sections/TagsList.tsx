import type { Row } from "@package/database/client";
import { For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TagWithPackages = Row["tags"] & {
	packageTags: readonly Row["packageTags"][];
};

type Props = {
	tags: readonly TagWithPackages[];
	onEdit: (tag: TagWithPackages) => void;
	onDelete: (tag: TagWithPackages) => void;
};

export const TagsList = (props: Props) => {
	return (
		<div class="mt-4">
			<Show
				when={props.tags.length > 0}
				fallback={
					<Text color="muted" class="py-8 text-center">
						No tags found. Create your first tag above.
					</Text>
				}
			>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-outline dark:border-outline-dark">
								<th class="py-3 px-2 text-left font-medium text-on-surface-muted dark:text-on-surface-dark-muted">
									Name
								</th>
								<th class="py-3 px-2 text-left font-medium text-on-surface-muted dark:text-on-surface-dark-muted">
									Slug
								</th>
								<th class="py-3 px-2 text-left font-medium text-on-surface-muted dark:text-on-surface-dark-muted">
									Description
								</th>
								<th class="py-3 px-2 text-left font-medium text-on-surface-muted dark:text-on-surface-dark-muted">
									Packages
								</th>
								<th class="py-3 px-2 text-right font-medium text-on-surface-muted dark:text-on-surface-dark-muted">
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							<For each={props.tags}>
								{(tag) => (
									<tr class="border-b border-outline/50 dark:border-outline-dark/50 hover:bg-surface-alt/50 dark:hover:bg-surface-dark-alt/50">
										<td class="py-3 px-2">
											<Text size="sm" weight="medium">
												{tag.name}
											</Text>
										</td>
										<td class="py-3 px-2">
											<Badge variant="secondary" size="sm">
												{tag.slug}
											</Badge>
										</td>
										<td class="py-3 px-2 max-w-xs">
											<Text size="sm" color="muted" class="truncate">
												{tag.description || "—"}
											</Text>
										</td>
										<td class="py-3 px-2">
											<Badge variant="info" size="sm">
												{tag.packageTags.length}
											</Badge>
										</td>
										<td class="py-3 px-2">
											<Flex justify="end" gap="sm">
												<Button
													variant="outline"
													size="sm"
													onClick={() => props.onEdit(tag)}
												>
													Edit
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => props.onDelete(tag)}
												>
													Delete
												</Button>
											</Flex>
										</td>
									</tr>
								)}
							</For>
						</tbody>
					</table>
				</div>
			</Show>
		</div>
	);
};
