import { Show } from "solid-js";
import { Skeleton } from "@/components/ui/skeleton";
import { useZero } from "./utils/zero-context-provider";

export const Home = () => {
	const zero = useZero();

	return (
		<div>
			<Show when={zero.authState() === "unauthenticated"}>
				<p>unauthenticated</p>
				<a href={import.meta.env.VITE_URL}>Login</a>
			</Show>
			<Show when={zero.authState() === "loading"}>
				<Skeleton class="w-100 h-5" />
				<Skeleton class="w-100 h-5" />
			</Show>
			<Show when={zero.authState() === "authenticated"}>
				<div>{zero.authState()}</div>
			</Show>
		</div>
	);
};
