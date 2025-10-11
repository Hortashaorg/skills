import { Show } from "solid-js";
import { Layout } from "@/layout/Layout";
import { useZero } from "@/test/context/use-zero";
import { Authenticated } from "./Authenticated";

export const Home = () => {
	const zero = useZero();

	return (
		<Layout>
			<Show when={zero.authState() === "unauthenticated"}>
				<p>unauthenticated</p>
				<a href={import.meta.env.VITE_URL}>Login</a>
			</Show>
			<Show when={zero.authState() === "authenticated"}>
				<div>{zero.authState()}</div>
				<Authenticated />
			</Show>
		</Layout>
	);
};
