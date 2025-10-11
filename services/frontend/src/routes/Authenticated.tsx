import { throwError } from "@package/common";
import { useQuery } from "@package/database/client";
import { For } from "solid-js";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/use-auth";
import { useZeroInstance } from "@/context/use-zero-instance";

function MyForm() {
	const zero = useZeroInstance();

	const handleSubmit = (e: SubmitEvent) => {
		if (e.target === null) throwError("");
		e.preventDefault();
		const target =
			(e.target as HTMLFormElement) ??
			throwError("Event does not have a target");
		const formData = new FormData(target);
		console.log(formData);

		zero.mutate.test.create("Example mutation from button click");
	};

	return (
		<form onSubmit={handleSubmit}>
			<Button type="submit">Submit (Example Mutation)</Button>
		</form>
	);
}

export const Authenticated = () => {
	const auth = useAuth();
	const zero = useZeroInstance();

	const [accounts] = useQuery(() => zero.query.account);

	if (auth.authState() !== "authenticated") {
		return <p>Not logged in</p>;
	}

	return (
		<>
			<MyForm />
			<For each={accounts()}>{(account) => <div>{account.id}</div>}</For>
		</>
	);
};
