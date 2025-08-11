import { useQuery } from "@package/database/client";
import { Show } from "solid-js";
import { Layout } from "@/layout/Layout";
import { useZero } from "@/utils/zero-context-provider";

export const Home = () => {
	const zero = useZero();

	const [accounts] = useQuery(() => {
		zero.z.mutate.test.create("testing something else");

		return zero.z.query.account;
	});

	return (
		<Layout>
			<Show when={zero.authState() === "unauthenticated"}>
				<p>unauthenticated</p>
				<a href={import.meta.env.VITE_URL}>Login</a>
			</Show>
			<Show when={zero.authState() === "authenticated"}>
				<div>{zero.authState()}</div>
			</Show>
			<div>
				{accounts().map((account) => (
					<div>{account.id}</div>
				))}
			</div>
		</Layout>
	);
};
