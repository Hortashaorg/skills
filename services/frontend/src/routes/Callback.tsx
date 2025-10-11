import { useNavigate } from "@solidjs/router";
import { type Component, createEffect } from "solid-js";
import { useAuth } from "@/context/use-auth";

export const Callback: Component = () => {
	const navigate = useNavigate();
	const auth = useAuth();

	createEffect(() => {
		const state = auth.authState();
		if (state === "authenticated") {
			navigate("/", { replace: true });
		} else if (state === "unauthenticated") {
			console.error("Authentication failed, redirecting to home");
			navigate("/", { replace: true });
		}
	});

	return <div>Completing login...</div>;
};
