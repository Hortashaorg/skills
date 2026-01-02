import { formatShortDate } from "@package/common";
import {
	mutators,
	queries,
	type Row,
	useQuery,
	useZero,
} from "@package/database/client";
import { A } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { CheckIcon, PlusIcon } from "@/components/primitives/icon";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UpvoteButton } from "@/components/ui/upvote-button";
import { createPackageRequest } from "@/hooks/createPackageRequest";
import { createPackageUpvote } from "@/hooks/createPackageUpvote";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";

type Package = Row["packages"] & {
	upvotes?: readonly Row["packageUpvotes"][];
};

export interface HeaderProps {
	pkg: Package;
}

export const Header = (props: HeaderProps) => {
	const zero = useZero();
	const upvote = createPackageUpvote(() => props.pkg);
	const request = createPackageRequest(() => ({
		name: props.pkg.name,
		registry: props.pkg.registry,
	}));

	const isLoggedIn = () => zero().userID !== "anon";
	const [projects] = useQuery(() => queries.projects.mine());
	const [projectDropdownOpen, setProjectDropdownOpen] = createSignal(false);
	const [addingToProject, setAddingToProject] = createSignal<string | null>(
		null,
	);

	const isPackageInProject = (projectId: string) => {
		const project = projects()?.find((p) => p.id === projectId);
		return project?.projectPackages?.some(
			(pp) => pp.packageId === props.pkg.id,
		);
	};

	const handleAddToProject = async (projectId: string) => {
		if (isPackageInProject(projectId)) return;

		setAddingToProject(projectId);
		try {
			await zero().mutate(
				mutators.projectPackages.add({
					projectId,
					packageId: props.pkg.id,
				}),
			);
			setProjectDropdownOpen(false);
		} catch (err) {
			console.error("Failed to add package to project:", err);
		} finally {
			setAddingToProject(null);
		}
	};

	return (
		<Card padding="lg">
			<Stack spacing="md">
				<Flex justify="between" align="start">
					<Stack spacing="xs">
						<Flex gap="sm" align="center">
							<Heading level="h1">{props.pkg.name}</Heading>
							<Badge variant="secondary" size="sm">
								{props.pkg.registry}
							</Badge>
						</Flex>
						<Show when={props.pkg.description}>
							<Text color="muted">{props.pkg.description}</Text>
						</Show>
					</Stack>
					<Flex gap="sm" align="center">
						<UpvoteButton
							count={upvote.upvoteCount()}
							isUpvoted={upvote.isUpvoted()}
							disabled={upvote.isDisabled()}
							onClick={upvote.toggle}
							size="md"
						/>
						<Show when={isLoggedIn()}>
							<div class="relative">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setProjectDropdownOpen(!projectDropdownOpen())}
									class="inline-flex items-center gap-1 text-sm px-3 py-1.5"
								>
									<PlusIcon size="sm" title="Add to project" />
									<span>Add to project</span>
								</Button>
								<Show when={projectDropdownOpen()}>
									<div class="absolute right-0 top-full mt-1 z-50 min-w-56 bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-radius shadow-lg">
										<Show
											when={(projects()?.length ?? 0) > 0}
											fallback={
												<div class="p-4 text-center">
													<Text size="sm" color="muted" class="mb-2">
														No projects yet
													</Text>
													<A
														href="/me/projects/new"
														class="text-sm text-primary dark:text-primary-dark hover:underline"
														onClick={() => setProjectDropdownOpen(false)}
													>
														Create a project
													</A>
												</div>
											}
										>
											<div class="p-1 max-h-64 overflow-auto">
												<For each={projects()}>
													{(project) => {
														const isInProject = () =>
															isPackageInProject(project.id);
														const isAdding = () =>
															addingToProject() === project.id;
														return (
															<button
																type="button"
																class="w-full text-left px-3 py-2 text-sm rounded-sm flex items-center justify-between gap-2 transition-colors hover:bg-surface-alt dark:hover:bg-surface-dark-alt disabled:opacity-50"
																disabled={isInProject() || isAdding()}
																onClick={() => handleAddToProject(project.id)}
															>
																<span class="truncate">{project.name}</span>
																<Show when={isInProject()}>
																	<CheckIcon
																		size="sm"
																		class="text-success flex-shrink-0"
																		title="Already in project"
																	/>
																</Show>
																<Show when={isAdding()}>
																	<span class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted">
																		Adding...
																	</span>
																</Show>
															</button>
														);
													}}
												</For>
											</div>
											<div class="border-t border-outline dark:border-outline-dark p-2">
												<A
													href="/me/projects/new"
													class="block w-full text-center text-xs text-primary dark:text-primary-dark hover:underline"
													onClick={() => setProjectDropdownOpen(false)}
												>
													+ Create new project
												</A>
											</div>
										</Show>
									</div>
								</Show>
							</div>
						</Show>
					</Flex>
				</Flex>

				{/* Links */}
				<Flex gap="lg" wrap="wrap">
					<Show when={props.pkg.homepage}>
						{(url) => (
							<a
								href={url()}
								target="_blank"
								rel="noopener noreferrer"
								class="text-sm text-primary dark:text-primary-dark hover:underline"
							>
								Homepage
							</a>
						)}
					</Show>
					<Show when={props.pkg.repository}>
						{(url) => (
							<a
								href={url()}
								target="_blank"
								rel="noopener noreferrer"
								class="text-sm text-primary dark:text-primary-dark hover:underline"
							>
								Repository
							</a>
						)}
					</Show>
				</Flex>

				{/* Metadata */}
				<Flex gap="sm" align="center">
					<Text size="xs" color="muted">
						Last updated: {formatShortDate(props.pkg.lastFetchSuccess)}
					</Text>
				</Flex>

				{/* Update button */}
				<Flex gap="sm" align="center">
					<Show
						when={!request.isRequested() && !request.isDisabled()}
						fallback={
							<Show when={request.isRequested()}>
								<Badge variant="info" size="md">
									Update requested
								</Badge>
							</Show>
						}
					>
						<Button variant="outline" onClick={() => request.submit()}>
							Request Update
						</Button>
					</Show>
					<Show when={!isLoggedIn()}>
						<button
							type="button"
							onClick={() => {
								saveReturnUrl();
								window.location.href = getAuthorizationUrl();
							}}
							class="text-sm text-primary dark:text-primary-dark hover:underline cursor-pointer"
						>
							Sign in to request updates
						</button>
					</Show>
				</Flex>
			</Stack>
		</Card>
	);
};
