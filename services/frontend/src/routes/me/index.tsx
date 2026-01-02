import { queries, useQuery, useZero } from "@package/database/client";
import { A, useNavigate } from "@solidjs/router";
import { createEffect, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
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

	const zitadelAccountUrl = () => {
		const config = getConfig();
		return `${config.zitadelIssuer}/ui/console/users/me`;
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString(undefined, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
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
											<div>
												<Text size="sm" color="muted">
													Name
												</Text>
												<Text weight="medium">{acc().name || "Not set"}</Text>
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
											<A
												href="/me/projects"
												class="block p-4 rounded-radius border border-outline dark:border-outline-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition"
											>
												<Flex align="center" gap="md">
													<div class="p-2 rounded-radius bg-primary/10 dark:bg-primary-dark/10">
														<svg
															class="w-6 h-6 text-primary dark:text-primary-dark"
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
													</div>
													<div>
														<Text weight="semibold">Your Projects</Text>
														<Text size="sm" color="muted">
															{projectCount()} project
															{projectCount() !== 1 ? "s" : ""}
														</Text>
													</div>
												</Flex>
											</A>

											<a
												href={zitadelAccountUrl()}
												target="_blank"
												rel="noopener noreferrer"
												class="block p-4 rounded-radius border border-outline dark:border-outline-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition"
											>
												<Flex align="center" gap="md">
													<div class="p-2 rounded-radius bg-secondary/10 dark:bg-secondary-dark/10">
														<svg
															class="w-6 h-6 text-secondary dark:text-secondary-dark"
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
													</div>
													<div>
														<Text weight="semibold">Account Settings</Text>
														<Text size="sm" color="muted">
															Manage password & security
														</Text>
													</div>
												</Flex>
											</a>
										</div>
									</Stack>
								</Card>
							</Stack>
						)}
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};
