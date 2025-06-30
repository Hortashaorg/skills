import { createQuery, type Schema, type Zero } from "@package/database/client";
import { For } from "solid-js";
import { Button } from "@/components/ui/button";

export const App = ({ z }: { z: Zero<Schema> }) => {
	const [messages] = createQuery(() => z.query.message, { ttl: "5m" });

	const uuid = crypto.randomUUID();
	z.mutate.message.insert({
		id: uuid,
		message: "hello world",
	});

	return (
		<div>
			<a href={import.meta.env.VITE_URL}>Login</a>
			<For each={messages()}>{(m) => <p>{m.message}</p>}</For>
			<Button>Hello world</Button>
		</div>
	);
};
