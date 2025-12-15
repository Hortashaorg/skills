import { useZero } from "@package/database/client";
import type { ParentComponent } from "solid-js";
import { Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { logout } from "@/context/app-provider";

export const Layout: ParentComponent = ({ children }) => {
	const zero = useZero();

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
						<Show when={zero().userID !== "anon"}>
							<Button variant="outline" size="sm" onClick={handleLogout}>
								Logout
							</Button>
						</Show>
					</Flex>
				</Container>
			</header>
			<main class="py-8">{children}</main>
		</div>
	);
};
