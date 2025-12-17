import { queries, useQuery, useZero } from "@package/database/client";
import { For, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const Authenticated = () => {
	const zero = useZero();

	// Use defined query instead of direct ZQL access
	const [accounts] = useQuery(queries.account.myAccount);

	if (zero().userID === "anon") {
		return <Text>Not logged in</Text>;
	}

	return (
		<Container>
			<Stack spacing="lg">
				<div>
					<Heading level="h1">Dashboard</Heading>
					<Text color="muted">Welcome back!</Text>
				</div>

				<div>
					<Heading level="h2" class="mb-4">
						Your Accounts
					</Heading>
					<Show
						when={accounts() && accounts().length > 0}
						fallback={
							<Card>
								<Text color="muted">No accounts found</Text>
							</Card>
						}
					>
						<Stack spacing="md">
							<For each={accounts()}>
								{(account) => (
									<Card>
										<Stack spacing="sm">
											<Text weight="semibold">Account</Text>
											<Text size="sm" color="muted">
												ID: {account.id}
											</Text>
											<Badge variant="success" size="sm">
												Active
											</Badge>
										</Stack>
									</Card>
								)}
							</For>
						</Stack>
					</Show>
				</div>
			</Stack>
		</Container>
	);
};
