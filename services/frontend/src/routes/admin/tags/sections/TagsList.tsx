import type { Row } from "@package/database/client";
import { For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";

type Tag = Row["tags"];

type Props = {
	tags: readonly Tag[];
	onEdit: (tag: Tag) => void;
	onDelete: (tag: Tag) => void;
};

export const TagsList = (props: Props) => {
	return (
		<Show
			when={props.tags.length > 0}
			fallback={
				<Text color="muted" class="py-8 text-center">
					No tags yet. Create your first tag.
				</Text>
			}
		>
			<Table>
				<Table.Header>
					<Table.Row header>
						<Table.Head>Name</Table.Head>
						<Table.Head>Description</Table.Head>
						<Table.Head align="right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					<For each={props.tags}>
						{(tag) => (
							<Table.Row hoverable>
								<Table.Cell>
									<Text size="sm" weight="medium">
										{tag.name}
									</Text>
								</Table.Cell>
								<Table.Cell class="max-w-md">
									<Text size="sm" color="muted" class="truncate">
										{tag.description || "—"}
									</Text>
								</Table.Cell>
								<Table.Cell align="right">
									<Flex justify="end" gap="sm">
										<Button
											variant="outline"
											size="sm"
											onClick={() => props.onEdit(tag)}
										>
											Edit
										</Button>
										<Button
											variant="danger"
											size="sm"
											onClick={() => props.onDelete(tag)}
										>
											Delete
										</Button>
									</Flex>
								</Table.Cell>
							</Table.Row>
						)}
					</For>
				</Table.Body>
			</Table>
		</Show>
	);
};
