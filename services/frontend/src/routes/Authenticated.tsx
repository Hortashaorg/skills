import { throwError } from "@package/common";
import { useQuery } from "@package/database/client";
import { For } from "solid-js";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/use-auth";
import { useZeroInstance } from "@/context/use-zero-instance";

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
	const auth = useAuth();
	const zero = useZeroInstance();

	// Use zero instance for queries - properly typed with single hook call!
	const [accounts] = useQuery(() => {
		zero.mutate.test.create("testing something else");
		return zero.query.account;
	});

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
