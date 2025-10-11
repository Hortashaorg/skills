import { throwError } from "@package/common";
import { useQuery } from "@package/database/client";
import { For } from "solid-js";
import { Button } from "@/components/ui/button";
import { useZero } from "@/test/context/use-zero";

function MyForm() {
	const handleSubmit = (e: SubmitEvent) => {
		if (e.target === null) throwError("");
		e.preventDefault();
		const target =
			(e.target as HTMLFormElement) ??
			throwError("Event does not have a target");
		const formData = new FormData(target);
		console.log(formData);
		// Handle form data here
	};

	return (
		<form onSubmit={handleSubmit}>
			<Button type="submit">Submit</Button>
		</form>
	);
}

export const Authenticated = () => {
	const { z, authState } = useZero();

	// Always call hooks at top level - useQuery works with Rocicorp's ZeroProvider
	const [accounts] = useQuery(() => {
		z.mutate.test.create("testing something else");
		return z.query.account;
	});

	if (authState() !== "authenticated") {
		return <p>Not logged in</p>;
	}

	return (
		<>
			<MyForm />
			<For each={accounts()}>{(account) => <div>{account.id}</div>}</For>
		</>
	);
};
