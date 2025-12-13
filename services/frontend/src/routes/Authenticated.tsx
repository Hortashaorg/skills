import { throwError } from "@package/common";
import { useQuery } from "@package/database/client";
import { For, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/use-auth";
import { useZeroInstance } from "@/context/use-zero-instance";

function MyForm() {
	const zero = useZeroInstance();

	const handleSubmit = (e: SubmitEvent) => {
		if (e.target === null) throwError("");
		e.preventDefault();
		const target =
			(e.target as HTMLFormElement) ??
			throwError("Event does not have a target");
		const formData = new FormData(target);
		console.log(formData);

		zero.mutate.test.create("Example mutation from button click");
	};

	return (
		<Card>
			<form onSubmit={handleSubmit}>
				<Stack spacing="md">
					<Heading level="h3">Create Test Data</Heading>
					<Button type="submit">Submit (Example Mutation)</Button>
				</Stack>
			</form>
		</Card>
	);
}

export const Authenticated = () => {
	const auth = useAuth();
	const zero = useZeroInstance();

	const [accounts] = useQuery(() => zero.query.account);

	if (auth.authState() !== "authenticated") {
		return <Text>Not logged in</Text>;
	}

	return (
		<Container>
			<Stack spacing="lg">
				<div>
					<Heading level="h1">Dashboard</Heading>
					<Text color="muted">Welcome back!</Text>
				</div>

				<MyForm />

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
