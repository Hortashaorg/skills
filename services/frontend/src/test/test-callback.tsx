import { useNavigate } from "@solidjs/router";
import { type Component, onMount } from "solid-js";

export const TestCallback: Component = () => {
	const navigate = useNavigate();

	onMount(() => {
		// The OAuth provider redirects here with ?code=...
		// Our ZeroProvider will automatically detect the code and login
		// Once that's done, redirect to home
		// Small delay to let the provider process the code
		setTimeout(() => {
			navigate("/", { replace: true });
		}, 100);
	});

	return <div>Completing login...</div>;
};
