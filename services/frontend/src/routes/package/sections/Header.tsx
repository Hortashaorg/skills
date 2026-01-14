import { formatShortDate } from "@package/common";
import type { Row } from "@package/database/client";
import { Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Package = Row["packages"];

export interface HeaderProps {
	pkg: Package;
}

export const Header = (props: HeaderProps) => {
	return (
		<Card padding="lg">
			<Stack spacing="md">
				{/* Title + Badge */}
				<Flex gap="sm" align="center" wrap="wrap">
					<Heading level="h1">{props.pkg.name}</Heading>
					<Badge variant="secondary" size="sm">
						{props.pkg.registry}
					</Badge>
				</Flex>

				{/* Description */}
				<Show when={props.pkg.description}>
					<Text color="muted" class="line-clamp-5 sm:line-clamp-3">
						{props.pkg.description}
					</Text>
				</Show>

				{/* Links + Metadata */}
				<Flex gap="lg" wrap="wrap" align="center">
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
					<Text size="xs" color="muted">
						Updated {formatShortDate(props.pkg.lastFetchSuccess)}
					</Text>
				</Flex>
			</Stack>
		</Card>
	);
};
