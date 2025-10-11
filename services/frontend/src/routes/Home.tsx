import { Show } from "solid-js";
import { useAuth } from "@/context/use-auth";
import { Layout } from "@/layout/Layout";
import { Authenticated } from "./Authenticated";

export const Home = () => {
	const auth = useAuth();

	return (
		<Layout>
			<Show when={auth.authState() === "unauthenticated"}>
				<p>unauthenticated</p>
				<a href={import.meta.env.VITE_URL}>Login</a>
			</Show>
			<Show when={auth.authState() === "authenticated"}>
				<div>{auth.authState()}</div>
				<Authenticated />
			</Show>
		</Layout>
	);
};
