import { A } from "@solidjs/router";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { getZitadelAccountUrl } from "@/lib/auth-url";

export const VerifyEmail = () => {
	return (
		<div class="min-h-screen bg-surface dark:bg-surface-dark flex items-center justify-center">
			<Container size="sm">
				<Stack spacing="lg" align="center" class="text-center">
					<Heading level="h1">Verify Your Email</Heading>
					<Text color="muted" as="p">
						Please verify your email address before signing in. Check your inbox
						for a verification link, or visit your account settings to resend
						it.
					</Text>
					<Flex gap="md">
						<a href={getZitadelAccountUrl()} target="_blank" rel="noreferrer">
							<Button variant="primary">Manage Account</Button>
						</a>
						<A href="/">
							<Button variant="outline">Back to Home</Button>
						</A>
					</Flex>
				</Stack>
			</Container>
		</div>
	);
};
