import { throwError } from "@package/common";
import { useQuery } from "@package/database/client";
import { For } from "solid-js";
import { Button } from "@/components/ui/button";
import { useZero } from "@/utils/zero-context-provider";

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
	const zero = useZero();

	if (zero.authState() === "authenticated") {
		const [accounts] = useQuery(() => {
			zero.z.mutate.test.create("testing something else");

			return zero.z.query.account;
		});
		return (
			<>
				<MyForm />
				<For each={accounts()}>{(account) => <div>{account.id}</div>}</For>
			</>
		);
	}

	return <p>Not logged in</p>;
};
