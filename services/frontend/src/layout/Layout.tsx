import { useConnectionState, useZero } from "@package/database/client";
import { A } from "@solidjs/router";
import type { ParentComponent } from "solid-js";
import { Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { getAuthData, logout } from "@/context/app-provider";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";

export const Layout: ParentComponent = ({ children }) => {
	const zero = useZero();
	const connectionState = useConnectionState();

	const handleLogout = async () => {
		await logout();
	};

	const handleSignIn = () => {
		saveReturnUrl();
		window.location.href = getAuthorizationUrl();
	};

	const isAnonymous = () => zero().userID === "anon";
	const isAdmin = () => getAuthData()?.roles?.includes("admin") ?? false;
	const displayUserId = () => {
		const id = zero().userID;
		if (id === "anon") return null;
		return id.length > 8 ? `${id.slice(0, 8)}...` : id;
	};

	return (
		<div class="min-h-screen bg-surface dark:bg-surface-dark">
			<header class="border-b border-outline dark:border-outline-dark">
				<Container>
					<Flex justify="between" align="center" class="h-16">
						<A href="/" class="hover:opacity-75 transition">
							<Text size="lg" weight="semibold" as="span">
								TechGarden
							</Text>
						</A>
						<Flex gap="md" align="center">
							<Show when={isAdmin()}>
								<A
									href="/admin/requests"
									class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark transition"
								>
									Admin
								</A>
							</Show>
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

							{/* User info and auth actions */}
							<Show
								when={!isAnonymous()}
								fallback={
									<Button variant="primary" size="sm" onClick={handleSignIn}>
										Sign in
									</Button>
								}
							>
								<Text size="sm" color="muted">
									{displayUserId()}
								</Text>
								<Button variant="outline" size="sm" onClick={handleLogout}>
									Logout
								</Button>
							</Show>
						</Flex>
					</Flex>
				</Container>
			</header>
			<main class="py-8">{children}</main>
			<Toast.Region />
		</div>
	);
};
