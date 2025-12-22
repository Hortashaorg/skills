import { mutators, useZero } from "@package/database/client";
import { For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";
import { REGISTRY_OPTIONS, type Registry } from "@/lib/registries";

export interface RequestFormProps {
	searchValue: string;
	effectiveRegistry: Registry;
	requestRegistry: Registry;
	showRegistryPicker: boolean;
	isRequested: boolean;
	onRegistryChange: (registry: Registry) => void;
	onRequestSubmitted: () => void;
}

export const RequestForm = (props: RequestFormProps) => {
	const zero = useZero();

	const handleRegistryChange = (
		e: Event & { currentTarget: HTMLSelectElement },
	) => {
		props.onRegistryChange(e.currentTarget.value as Registry);
	};

	const handleRequestPackage = async () => {
		const packageName = props.searchValue.trim();
		if (!packageName) return;

		const write = zero().mutate(
			mutators.packageRequests.create({
				packageName,
				registry: props.effectiveRegistry,
			}),
		);

		const res = await write.client;

		if (res.type === "error") {
			console.error("Failed to request package:", res.error);
			toast.error("Failed to submit request. Please try again.");
			return;
		}

		props.onRequestSubmitted();
		toast.success(
			`Request submitted for "${packageName}" on ${props.effectiveRegistry}`,
		);
	};

	return (
		<Card padding="lg">
			<Stack spacing="md" align="center">
				<Stack spacing="xs" align="center">
					<Text weight="semibold">"{props.searchValue}" not found</Text>
					<Text color="muted" size="sm" class="text-center">
						This package isn't in our database yet.
						<Show when={zero().userID === "anon"}> Sign in to request it.</Show>
					</Text>
				</Stack>

				<Show
					when={zero().userID !== "anon"}
					fallback={
						<Button
							variant="primary"
							onClick={() => {
								saveReturnUrl();
								window.location.href = getAuthorizationUrl();
							}}
						>
							Sign in to request
						</Button>
					}
				>
					<Show
						when={!props.isRequested}
						fallback={
							<Badge variant="info" size="md">
								Request submitted
							</Badge>
						}
					>
						<Flex gap="sm" align="center">
							<Show when={props.showRegistryPicker}>
								<select
									value={props.requestRegistry}
									onChange={handleRegistryChange}
									class="h-10 rounded-md border border-outline dark:border-outline-dark bg-surface dark:bg-surface-dark px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 cursor-pointer"
								>
									<For each={REGISTRY_OPTIONS}>
										{(option) => (
											<option value={option.value}>{option.label}</option>
										)}
									</For>
								</select>
							</Show>
							<Button onClick={handleRequestPackage}>
								Request from {props.effectiveRegistry}
							</Button>
						</Flex>
					</Show>
				</Show>
			</Stack>
		</Card>
	);
};
