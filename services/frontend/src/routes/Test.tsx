import { useQuery } from "@package/database/client";
import { For, Show } from "solid-js";
import { useZero } from "@/test/context/use-zero";

export const Authenticated = () => {
	const { z, authState, authData } = useZero();

	// useQuery now works because we wrapped with Rocicorp's ZeroProvider
	const [accounts] = useQuery(() => {
		z.mutate.test.create("testing something else from Test.tsx");
		return z.query.account;
	});

	return (
		<div style={{ padding: "20px", border: "2px solid orange" }}>
			<h2>Test Component - Experimenting with createQuery</h2>

			<Show when={authState() === "authenticated"}>
				<div>
					<p>✓ Authenticated!</p>
					<p>Access Token: {authData()?.accessToken?.substring(0, 20)}...</p>
					<p>User ID: {authData()?.userId}</p>

					<h3>Accounts from createQuery:</h3>
					<For each={accounts()}>
						{(account) => <div>Account ID: {account.id}</div>}
					</For>
				</div>
			</Show>

			<Show when={authState() !== "authenticated"}>
				<p>Not logged in</p>
			</Show>
		</div>
	);
};
