import {
	mutators,
	queries,
	type Row,
	useQuery,
	useZero,
} from "@package/database/client";
import { Show } from "solid-js";
import { AuthGuard } from "@/components/composite/auth-guard";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthData } from "@/context/app-provider";
import { useModalState } from "@/hooks/useModalState";
import { Layout } from "@/layout/Layout";
import { handleMutationError } from "@/lib/mutation-error";
import { TagForm } from "./sections/TagForm";
import { TagsList } from "./sections/TagsList";

type Tag = Row["tags"];

const TagsListSkeleton = () => (
	<Card padding="lg">
		<Stack spacing="md">
			<Flex justify="between" align="center">
				<Skeleton variant="text" width="100px" />
				<Skeleton variant="rectangular" width="60px" height="28px" />
			</Flex>
			<Flex justify="between" align="center">
				<Skeleton variant="text" width="120px" />
				<Skeleton variant="rectangular" width="60px" height="28px" />
			</Flex>
			<Flex justify="between" align="center">
				<Skeleton variant="text" width="80px" />
				<Skeleton variant="rectangular" width="60px" height="28px" />
			</Flex>
			<Flex justify="between" align="center">
				<Skeleton variant="text" width="140px" />
				<Skeleton variant="rectangular" width="60px" height="28px" />
			</Flex>
		</Stack>
	</Card>
);

export const AdminTags = () => {
	const zero = useZero();

	const isAdmin = () => getAuthData()?.roles?.includes("admin") ?? false;
	const isLoggedIn = () => zero().userID !== "anon";

	const [allTags, tagsResult] = useQuery(() => queries.tags.list());
	const isLoading = () => tagsResult().type !== "complete";

	const formModal = useModalState<Tag>();
	const deleteModal = useModalState<Tag>();

	const sortedTags = () => {
		const tags = allTags() ?? [];
		return [...tags].sort((a, b) => a.name.localeCompare(b.name));
	};

	const handleCreate = () => formModal.open();
	const handleEdit = (tag: Tag) => formModal.open(tag);
	const handleDeleteClick = (tag: Tag) => deleteModal.open(tag);

	const handleDeleteConfirm = async () => {
		const tag = deleteModal.data();
		if (!tag) return;

		try {
			const result = await zero().mutate(mutators.tags.remove({ id: tag.id }))
				.client;
			if (result.type === "error") {
				throw result.error;
			}
		} catch (err) {
			handleMutationError(err, "delete tag");
		} finally {
			deleteModal.close();
		}
	};

	const handleSave = async (data: { name: string; description?: string }) => {
		try {
			const editing = formModal.data();
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
			formModal.close();
		} catch (err) {
			handleMutationError(err, "save tag");
		}
	};

	return (
		<Layout>
			<Container size="md">
				<Stack spacing="lg" class="py-8">
					<AuthGuard hasAccess={isLoggedIn() && isAdmin()}>
						<Flex justify="between" align="center">
							<Heading level="h1">Tags</Heading>
							<Show when={!formModal.isOpen()}>
								<Button variant="primary" onClick={handleCreate}>
									Create Tag
								</Button>
							</Show>
						</Flex>

						<Show when={!isLoading()} fallback={<TagsListSkeleton />}>
							<TagsList
								tags={sortedTags()}
								onEdit={handleEdit}
								onDelete={handleDeleteClick}
							/>

							<Text size="sm" color="muted">
								{sortedTags().length} tag{sortedTags().length !== 1 ? "s" : ""}
							</Text>
						</Show>

						<Show when={formModal.isOpen()}>
							<Card padding="lg">
								<TagForm
									editingTag={formModal.data()}
									onSave={handleSave}
									onCancel={formModal.close}
								/>
							</Card>
						</Show>
					</AuthGuard>
				</Stack>
			</Container>

			<AlertDialog
				open={deleteModal.isOpen()}
				onOpenChange={(open) => !open && deleteModal.close()}
				title="Delete Tag"
				description={`Are you sure you want to delete "${deleteModal.data()?.name}"? This will remove it from all packages that use this tag.`}
				confirmText="Delete"
				variant="danger"
				onConfirm={handleDeleteConfirm}
			/>
		</Layout>
	);
};

export default AdminTags;
