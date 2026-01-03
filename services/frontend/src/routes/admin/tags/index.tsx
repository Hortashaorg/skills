import {
	mutators,
	queries,
	type Row,
	useQuery,
	useZero,
} from "@package/database/client";
import { createSignal, Show } from "solid-js";
import { AuthGuard } from "@/components/composite/auth-guard";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { getAuthData } from "@/context/app-provider";
import { Layout } from "@/layout/Layout";
import { TagForm } from "./sections/TagForm";
import { TagsList } from "./sections/TagsList";

type TagWithPackages = Row["tags"] & {
	packageTags: readonly Row["packageTags"][];
};

export const AdminTags = () => {
	const zero = useZero();

	const isAdmin = () => getAuthData()?.roles?.includes("admin") ?? false;
	const isLoggedIn = () => zero().userID !== "anon";

	const [allTags] = useQuery(() => queries.tags.all());

	const [showForm, setShowForm] = createSignal(false);
	const [editingTag, setEditingTag] = createSignal<TagWithPackages | null>(
		null,
	);
	const [deleteDialogOpen, setDeleteDialogOpen] = createSignal(false);
	const [tagToDelete, setTagToDelete] = createSignal<TagWithPackages | null>(
		null,
	);

	const sortedTags = () => {
		const tags = allTags() ?? [];
		return [...tags].sort((a, b) => a.name.localeCompare(b.name));
	};

	const handleCreate = () => {
		setEditingTag(null);
		setShowForm(true);
	};

	const handleEdit = (tag: TagWithPackages) => {
		setEditingTag(tag);
		setShowForm(true);
	};

	const handleDeleteClick = (tag: TagWithPackages) => {
		setTagToDelete(tag);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		const tag = tagToDelete();
		if (!tag) return;

		try {
			const result = await zero().mutate(mutators.tags.remove({ id: tag.id }))
				.client;
			if (result.type === "error") {
				throw result.error;
			}
		} catch (err) {
			console.error("Failed to delete tag:", err);
			toast.error("Failed to delete tag. Please try again.");
		} finally {
			setTagToDelete(null);
			setDeleteDialogOpen(false);
		}
	};

	const handleSave = async (data: { name: string; description?: string }) => {
		try {
			const editing = editingTag();
			if (editing) {
				const result = await zero().mutate(
					mutators.tags.update({
						id: editing.id,
						name: data.name,
						description: data.description,
					}),
				).client;
				if (result.type === "error") {
					throw result.error;
				}
			} else {
				const result = await zero().mutate(
					mutators.tags.create({
						name: data.name,
						description: data.description,
					}),
				).client;
				if (result.type === "error") {
					throw result.error;
				}
			}
			setShowForm(false);
			setEditingTag(null);
		} catch (err) {
			console.error("Failed to save tag:", err);
			toast.error("Failed to save tag. Please try again.");
		}
	};

	const handleCancel = () => {
		setShowForm(false);
		setEditingTag(null);
	};

	return (
		<Layout>
			<Container size="lg">
				<Stack spacing="lg" class="py-8">
					<AuthGuard hasAccess={isLoggedIn() && isAdmin()}>
						<Flex justify="between" align="center">
							<Heading level="h1">Tags</Heading>
							<Show when={!showForm()}>
								<Button variant="primary" onClick={handleCreate}>
									Create Tag
								</Button>
							</Show>
						</Flex>

						<Show when={showForm()}>
							<Card padding="lg">
								<TagForm
									editingTag={editingTag()}
									onSave={handleSave}
									onCancel={handleCancel}
								/>
							</Card>
						</Show>

						<TagsList
							tags={sortedTags()}
							onEdit={handleEdit}
							onDelete={handleDeleteClick}
						/>

						<Text size="sm" color="muted">
							{sortedTags().length} tag{sortedTags().length !== 1 ? "s" : ""}{" "}
							total
						</Text>
					</AuthGuard>
				</Stack>
			</Container>

			<AlertDialog
				open={deleteDialogOpen()}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Tag"
				description={`Delete tag "${tagToDelete()?.name}"? This will remove it from all packages.`}
				confirmText="Delete"
				variant="danger"
				onConfirm={handleDeleteConfirm}
			/>
		</Layout>
	);
};
