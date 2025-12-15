import { useConnectionState, useZero } from "@package/database/client";
import type { ParentComponent } from "solid-js";
import { Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logout } from "@/context/app-provider";

export const Layout: ParentComponent = ({ children }) => {
	const zero = useZero();
	const connectionState = useConnectionState();

	const handleLogout = async () => {
		await logout();
	};

	return (
		<div class="min-h-screen bg-surface dark:bg-surface-dark">
			<header class="border-b border-outline dark:border-outline-dark">
				<Container>
					<Flex justify="between" align="center" class="h-16">
						<Text size="lg" weight="semibold" as="span">
							My App
						</Text>
						<Flex gap="md" align="center">
							<Show when={connectionState().name === "connected"}>
								<Badge variant="success" size="sm">
									Connected
								</Badge>
							</Show>
							<Show when={connectionState().name === "connecting"}>
								<Badge variant="info" size="sm">
									Connecting...
								</Badge>
							</Show>
							<Show when={connectionState().name === "disconnected"}>
								<Badge variant="warning" size="sm">
									Offline
								</Badge>
							</Show>
							<Show when={connectionState().name === "needs-auth"}>
								<Badge variant="info" size="sm">
									Refreshing token...
								</Badge>
							</Show>
							<Show when={connectionState().name === "error"}>
								<Badge variant="danger" size="sm">
									Connection Error
								</Badge>
							</Show>
							<Show when={zero().userID !== "anon"}>
								<Button variant="outline" size="sm" onClick={handleLogout}>
									Logout
								</Button>
							</Show>
						</Flex>
					</Flex>
				</Container>
			</header>
			<main class="py-8">{children}</main>
		</div>
	);
};
