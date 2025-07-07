import { Show } from "solid-js";
import { Button } from "@/components/ui/button";
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
				<p>Loading...</p>
			</Show>
			<Show when={zero.authState() === "authenticated"}>
				<div class="flex flex-col gap-1">
					<Skeleton class="w-100 h-5" />
					<Skeleton class="w-100 h-5" />
					<Skeleton class="w-100 h-5" />
					<Skeleton class="w-100 h-5" />
					<Skeleton class="w-100 h-5" />
				</div>
				<Button>Hello world</Button>
				<a href={import.meta.env.VITE_URL}>Login</a>
			</Show>
		</div>
	);
};
