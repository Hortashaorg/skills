import { useQuery } from "@package/database/client";
import { For } from "solid-js";
import { useZero } from "@/utils/zero-context-provider";

export const Authenticated = () => {
	const zero = useZero();

	if (zero.authState() === "authenticated") {
		const [accounts] = useQuery(() => {
			zero.z.mutate.test.create("testing something else");

			return zero.z.query.account;
		});
		return <For each={accounts()}>{(account) => <div>{account.id}</div>}</For>;
	}

	return <p>Not logged in</p>;
};
