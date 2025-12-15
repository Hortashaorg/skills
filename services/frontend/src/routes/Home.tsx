import { useZero } from "@package/database/client";
import { Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { Layout } from "@/layout/Layout";
import { getAuthorizationUrl } from "@/lib/auth-url";
import { Authenticated } from "./Authenticated";

export const Home = () => {
	const zero = useZero();

	return (
		<Layout>
			<Show when={zero().userID === "anon"}>
				<Container size="md">
					<div class="flex items-center justify-center py-24">
						<Card padding="lg" class="max-w-md w-full">
							<Stack spacing="lg" align="center">
								<Heading level="h1" class="text-center">
									Welcome
								</Heading>
								<Text color="muted" class="text-center" as="p">
									Please sign in to continue
								</Text>
								<a
									href={getAuthorizationUrl()}
									class="inline-flex items-center justify-center whitespace-nowrap rounded-radius border font-medium tracking-wide transition hover:opacity-75 text-center focus-visible:outline-2 focus-visible:outline-offset-2 active:opacity-100 active:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-primary border-primary text-on-primary focus-visible:outline-primary dark:bg-primary-dark dark:border-primary-dark dark:text-on-primary-dark dark:focus-visible:outline-primary-dark text-sm px-4 py-2 w-full"
								>
									Sign In with Zitadel
								</a>
							</Stack>
						</Card>
					</div>
				</Container>
			</Show>
			<Show when={zero().userID !== "anon"}>
				<Authenticated />
			</Show>
		</Layout>
	);
};
