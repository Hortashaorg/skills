import { type Row, useZero } from "@package/database/client";
import { Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
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
					<UpvoteButton
						count={upvote.upvoteCount()}
						isUpvoted={upvote.isUpvoted()}
						disabled={upvote.isDisabled()}
						onClick={upvote.toggle}
						size="md"
					/>
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
						Last updated:{" "}
						{new Date(props.pkg.lastFetchSuccess).toLocaleDateString()}
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
					<Show when={zero().userID === "anon"}>
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
