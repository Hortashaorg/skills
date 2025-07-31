import { Show } from "solid-js";
import { Layout } from "@/layout/Layout";
import { useZero } from "@/utils/zero-context-provider";

export const Home = () => {
	const zero = useZero();
	zero.z.mutate.test.create("testing something else");

	return (
		<Layout>
			<Show when={zero.authState() === "unauthenticated"}>
				<p>unauthenticated</p>
				<a href={import.meta.env.VITE_URL}>Login</a>
			</Show>
			<Show when={zero.authState() === "authenticated"}>
				<div>{zero.authState()}</div>
			</Show>
		</Layout>
	);
};
