import { A } from "@solidjs/router";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";

export const NotFound = () => {
	return (
		<div class="min-h-screen bg-surface dark:bg-surface-dark flex items-center justify-center">
			<Container size="sm">
				<Stack spacing="lg" align="center" class="text-center">
					<Text size="lg" color="muted">
						404
					</Text>
					<Heading level="h1">Page Not Found</Heading>
					<Text color="muted" as="p">
						The page you're looking for doesn't exist or has been moved.
					</Text>
					<A href="/">
						<Button variant="primary">Back to Home</Button>
					</A>
				</Stack>
			</Container>
		</div>
	);
};
