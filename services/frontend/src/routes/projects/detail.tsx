import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { A, useNavigate, useParams } from "@solidjs/router";
import { createMemo, Match, Show, Switch } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { useEcosystemSearch } from "@/hooks/ecosystems/useEcosystemSearch";
import { usePackageSearch } from "@/hooks/packages/usePackageSearch";
import { useProjectSearch } from "@/hooks/projects/useProjectSearch";
import { useUserSearch } from "@/hooks/users/useUserSearch";
import { Layout } from "@/layout/Layout";
import { handleMutationError } from "@/lib/mutation-error";
import { BoardSection } from "./sections/BoardSection";
import { DiscussionTab } from "./sections/DiscussionTab";
import { Header } from "./sections/Header";
import { ProjectDetailSkeleton } from "./sections/ProjectDetailSkeleton";
import { SettingsTab } from "./sections/SettingsTab";

export const ProjectDetail = () => {
	const params = useParams<{ id: string; tab?: string }>();
	const navigate = useNavigate();
	const zero = useZero();

	const tab = () => params.tab || "board";
	const baseUrl = () => `/projects/${params.id}`;

	const [project, projectResult] = useQuery(() =>
		queries.projects.byId({ id: params.id }),
	);

	const isLoading = () => projectResult().type !== "complete";
	const isLoggedIn = () => zero().userID !== "anon";
	const isOwner = () => {
		const p = project();
		if (!p || !isLoggedIn()) return false;
		const members = p.projectMembers ?? [];
		return members.some(
			(m) => m.accountId === zero().userID && m.role === "owner",
		);
	};

	// Upvote
	const userUpvote = createMemo(() => {
		const p = project();
		if (!p?.upvotes) return null;
		return p.upvotes.find((u) => u.accountId === zero().userID) ?? null;
	});

	const handleUpvote = () => {
		const p = project();
		if (!p || !isLoggedIn()) return;

		const upvote = userUpvote();
		try {
			if (upvote) {
				zero().mutate(
					mutators.projectUpvotes.remove({
						id: upvote.id,
						projectId: p.id,
					}),
				);
			} else {
				zero().mutate(
					mutators.projectUpvotes.create({
						projectId: p.id,
					}),
				);
			}
		} catch (err) {
			handleMutationError(err, "update upvote");
		}
	};

	// Entity search for discussion tab
	const packageSearch = usePackageSearch({ showRecentWhenEmpty: true });
	const ecosystemSearch = useEcosystemSearch({ showRecentWhenEmpty: true });
	const projectSearch = useProjectSearch({ showRecentWhenEmpty: true });
	const userSearch = useUserSearch({
		showRecentWhenEmpty: true,
		sortBy: "createdAt",
	});

	const entitySearch = {
		packages: packageSearch,
		ecosystems: ecosystemSearch,
		projects: projectSearch,
		users: userSearch,
	};

	// Member management
	const handleAddMember = (
		accountId: string,
		role: "owner" | "contributor",
	) => {
		const p = project();
		if (!p) return;
		try {
			zero().mutate(
				mutators.projectMembers.add({
					projectId: p.id,
					accountId,
					role,
				}),
			);
		} catch (err) {
			handleMutationError(err, "add member");
		}
	};

	const handleUpdateRole = (
		memberId: string,
		role: "owner" | "contributor",
	) => {
		const p = project();
		if (!p) return;
		try {
			zero().mutate(
				mutators.projectMembers.updateRole({
					id: memberId,
					projectId: p.id,
					role,
				}),
			);
		} catch (err) {
			handleMutationError(err, "update member role");
		}
	};

	const handleRemoveMember = (memberId: string) => {
		const p = project();
		if (!p) return;
		try {
			zero().mutate(
				mutators.projectMembers.remove({
					id: memberId,
					projectId: p.id,
				}),
			);
		} catch (err) {
			handleMutationError(err, "remove member");
		}
	};

	// Inline edit save
	const handleSave = (name: string, description: string) => {
		const p = project();
		if (!p) return;
		try {
			zero().mutate(
				mutators.projects.update({
					id: p.id,
					name,
					description: description || undefined,
				}),
			);
		} catch (err) {
			handleMutationError(err, "update project");
		}
	};

	return (
		<Layout>
			<Container size="lg">
				<Stack spacing="lg" class="py-8">
					<Show when={!isLoading()} fallback={<ProjectDetailSkeleton />}>
						<Show
							when={project()}
							fallback={
								<Card padding="lg">
									<Stack spacing="md" align="center">
										<Heading level="h2">Project not found</Heading>
										<Text color="muted">
											This project doesn't exist or has been deleted.
										</Text>
										<A
											href="/projects"
											class={buttonVariants({ variant: "secondary" })}
										>
											Back to Projects
										</A>
									</Stack>
								</Card>
							}
						>
							{(p) => (
								<>
									<Header
										name={p().name}
										description={p().description}
										memberCount={p().projectMembers?.length ?? 0}
										upvoteCount={p().upvotes?.length ?? 0}
										hasUpvoted={!!userUpvote()}
										isLoggedIn={isLoggedIn()}
										onUpvote={handleUpvote}
										canEdit={isOwner()}
										onSave={handleSave}
									/>

									<Tabs.Root
										value={tab()}
										onChange={(value) => {
											navigate(
												value === "board" ? baseUrl() : `${baseUrl()}/${value}`,
											);
										}}
									>
										<Tabs.List variant="line">
											<Tabs.Trigger value="board" variant="line">
												Board
											</Tabs.Trigger>
											<Tabs.Trigger value="discussion" variant="line">
												Discussion
											</Tabs.Trigger>
											<Tabs.Trigger value="settings" variant="line">
												Settings
											</Tabs.Trigger>
										</Tabs.List>
									</Tabs.Root>

									<Switch>
										<Match when={tab() === "board"}>
											<BoardSection project={p()} isOwner={isOwner()} />
										</Match>

										<Match when={tab() === "discussion"}>
											<DiscussionTab projectId={p().id} search={entitySearch} />
										</Match>

										<Match when={tab() === "settings"}>
											<SettingsTab
												members={p().projectMembers ?? []}
												isOwner={isOwner()}
												currentUserId={zero().userID}
												onAddMember={handleAddMember}
												onUpdateRole={handleUpdateRole}
												onRemoveMember={handleRemoveMember}
											/>
										</Match>
									</Switch>
								</>
							)}
						</Show>
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

export default ProjectDetail;
