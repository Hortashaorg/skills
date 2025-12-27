import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";

export interface ErrorFallbackProps {
	error: Error;
	reset: () => void;
}

export const ErrorFallback = (props: ErrorFallbackProps) => {
	return (
		<div class="min-h-screen bg-surface dark:bg-surface-dark flex items-center justify-center">
			<Container size="sm">
				<Stack spacing="lg" align="center" class="text-center">
					<Text size="lg" color="muted">
						Something went wrong
					</Text>
					<Heading level="h1">Unexpected Error</Heading>
					<Text color="muted" as="p">
						An error occurred while loading this page. Please try again.
					</Text>
					<Text size="sm" color="muted" class="font-mono">
						{props.error.message}
					</Text>
					<Button variant="primary" onClick={() => props.reset()}>
						Try Again
					</Button>
				</Stack>
			</Container>
		</div>
	);
};
