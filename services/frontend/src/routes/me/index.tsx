import { formatDate } from "@package/common";
import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import { IconLinkCard } from "@/components/composite/icon-link-card";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAuthData, logout } from "@/context/app-provider";
import { Layout } from "@/layout/Layout";
import { getConfig } from "@/lib/config";

export const Profile = () => {
	const zero = useZero();
	const navigate = useNavigate();
	const isLoggedIn = () => zero().userID !== "anon";

	// Redirect to home if not logged in
	createEffect(() => {
		if (!isLoggedIn()) {
			navigate("/", { replace: true });
		}
	});

	const [accounts, accountResult] = useQuery(() => queries.account.myAccount());
	const [projects] = useQuery(() => queries.projects.mine());

	const account = () => accounts()?.[0];
	const isLoading = () => accountResult().type !== "complete";
	const projectCount = () => projects()?.length ?? 0;

	// Username editing state
	const [isEditingUsername, setIsEditingUsername] = createSignal(false);
	const [editUsername, setEditUsername] = createSignal("");
	const [usernameError, setUsernameError] = createSignal<string | null>(null);
	const [isSaving, setIsSaving] = createSignal(false);

	// Delete account state
	const [deleteDialogOpen, setDeleteDialogOpen] = createSignal(false);
	const [isDeleting, setIsDeleting] = createSignal(false);
	const [deleteError, setDeleteError] = createSignal<string | null>(null);

	const startEditingUsername = () => {
		const acc = account();
		if (acc) {
			setEditUsername(acc.name ?? "");
			setUsernameError(null);
			setIsEditingUsername(true);
		}
	};

	const cancelEditingUsername = () => {
		setIsEditingUsername(false);
		setUsernameError(null);
	};

	const saveUsername = async () => {
		const username = editUsername().trim();

		if (!username) {
			setUsernameError("Username is required");
			return;
		}

		if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
			setUsernameError(
				"Username can only contain letters, numbers, underscores, and hyphens",
			);
			return;
		}

		if (username.length > 50) {
			setUsernameError("Username must be 50 characters or less");
			return;
		}

		setIsSaving(true);
		setUsernameError(null);

		try {
			await zero().mutate(mutators.account.updateName({ name: username }))
				.client;
			setIsEditingUsername(false);
		} catch (err) {
			console.error("Failed to update username:", err);
			if (err instanceof Error && err.message.includes("unique")) {
				setUsernameError("This username is already taken");
			} else {
				setUsernameError("Failed to update username. Please try again.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	const zitadelAccountUrl = () => {
		const config = getConfig();
		return `${config.zitadelIssuer}/ui/console/users/me`;
	};

	const handleDeleteAccount = async () => {
		setIsDeleting(true);
		setDeleteError(null);

		try {
			const config = getConfig();
			const authData = getAuthData();
			const response = await fetch(`${config.backendUrl}/api/account/delete`, {
				method: "POST",
				credentials: "include",
				headers: authData?.accessToken
					? { Authorization: `Bearer ${authData.accessToken}` }
					: {},
			});

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				throw new Error(data.error || "Failed to delete account");
			}

			await logout();
			navigate("/", { replace: true });
		} catch (err) {
			console.error("Failed to delete account:", err);
			setDeleteError(
				err instanceof Error ? err.message : "Failed to delete account",
			);
			setIsDeleting(false);
		}
	};

	return (
		<Layout>
			<Container size="md">
				<Stack spacing="lg" class="py-8">
					<Heading level="h1">Your Profile</Heading>

					<Show
						when={!isLoading() && account()}
						fallback={<Text color="muted">Loading...</Text>}
					>
						{(acc) => (
							<Stack spacing="lg">
								{/* Account Info */}
								<Card padding="lg">
									<Stack spacing="md">
										<Heading level="h2">Account</Heading>
										<div class="grid gap-4 sm:grid-cols-2">
											<div class="sm:col-span-2">
												<Text size="sm" color="muted" class="mb-1">
													Username
												</Text>
												<Show
													when={isEditingUsername()}
													fallback={
														<Flex align="center" gap="sm">
															<Text weight="medium">
																{acc().name || (
																	<span class="text-on-surface-muted dark:text-on-surface-dark-muted italic">
																		Not set
																	</span>
																)}
															</Text>
															<button
																type="button"
																onClick={startEditingUsername}
																class="text-primary dark:text-primary-dark text-sm hover:underline"
															>
																Edit
															</button>
														</Flex>
													}
												>
													<Stack spacing="sm">
														<Flex gap="sm">
															<input
																type="text"
																value={editUsername()}
																onInput={(e) =>
																	setEditUsername(e.currentTarget.value)
																}
																onKeyDown={(e) => {
																	if (e.key === "Enter") saveUsername();
																	if (e.key === "Escape")
																		cancelEditingUsername();
																}}
																disabled={isSaving()}
																class="flex-1 px-3 py-1.5 text-sm rounded-radius border border-outline dark:border-outline-dark bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark disabled:opacity-50"
																placeholder="Enter username"
															/>
															<Button
																variant="primary"
																size="sm"
																onClick={saveUsername}
																disabled={isSaving()}
															>
																{isSaving() ? "Saving..." : "Save"}
															</Button>
															<Button
																variant="outline"
																size="sm"
																onClick={cancelEditingUsername}
																disabled={isSaving()}
															>
																Cancel
															</Button>
														</Flex>
														<Show when={usernameError()}>
															<Text
																size="sm"
																class="text-danger dark:text-danger-dark"
															>
																{usernameError()}
															</Text>
														</Show>
														<Text size="xs" color="muted">
															Letters, numbers, underscores, and hyphens only
														</Text>
													</Stack>
												</Show>
											</div>
											<div>
												<Text size="sm" color="muted">
													Email
												</Text>
												<Text weight="medium">{acc().email || "Not set"}</Text>
											</div>
											<div>
												<Text size="sm" color="muted">
													Member since
												</Text>
												<Text weight="medium">
													{formatDate(acc().createdAt)}
												</Text>
											</div>
											<div>
												<Text size="sm" color="muted">
													Projects
												</Text>
												<Text weight="medium">{projectCount()}</Text>
											</div>
										</div>
									</Stack>
								</Card>

								{/* Quick Links */}
								<Card padding="lg">
									<Stack spacing="md">
										<Heading level="h2">Quick Links</Heading>
										<div class="grid gap-4 sm:grid-cols-2">
											<IconLinkCard
												href="/me/projects"
												title="Your Projects"
												description={
													<>
														{projectCount()} project
														{projectCount() !== 1 ? "s" : ""}
													</>
												}
												color="primary"
												icon={
													<svg
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<title>Projects</title>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
														/>
													</svg>
												}
											/>

											<IconLinkCard
												href={zitadelAccountUrl()}
												title="Account Settings"
												description="Manage password & security"
												color="secondary"
												external
												icon={
													<svg
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<title>Account Settings</title>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
														/>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
														/>
													</svg>
												}
											/>
										</div>
									</Stack>
								</Card>

								{/* Privacy & Data */}
								<Card padding="lg">
									<Stack spacing="md">
										<Heading level="h2">Privacy & Data</Heading>
										<IconLinkCard
											href="/privacy"
											title="Privacy Policy"
											description="How we handle your data"
											color="info"
											icon={
												<svg
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<title>Privacy Policy</title>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
											}
										/>

										<div class="pt-4 border-t border-outline dark:border-outline-dark">
											<Stack spacing="sm">
												<Heading level="h3">Delete Account</Heading>
												<Text size="sm" color="muted">
													Permanently delete your account and personal data.
													Your projects will remain visible but will be
													attributed to "Deleted User".
												</Text>
												<Show when={deleteError()}>
													<Text
														size="sm"
														class="text-danger dark:text-danger-dark"
													>
														{deleteError()}
													</Text>
												</Show>
												<div>
													<Button
														variant="danger"
														size="sm"
														onClick={() => setDeleteDialogOpen(true)}
														disabled={isDeleting()}
													>
														{isDeleting() ? "Deleting..." : "Delete Account"}
													</Button>
												</div>
											</Stack>
										</div>
									</Stack>
								</Card>
							</Stack>
						)}
					</Show>
				</Stack>
			</Container>

			<AlertDialog
				open={deleteDialogOpen()}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Account"
				description="Are you sure you want to delete your account? This action cannot be undone. Your email and username will be permanently removed. Projects you created will remain but show 'Deleted User' as the author."
				confirmText="Delete My Account"
				variant="danger"
				onConfirm={handleDeleteAccount}
			/>
		</Layout>
	);
};
