import { createEffect, createSignal, onMount } from "solid-js";

const STORAGE_KEY = "techgarden-theme";

export const useDarkMode = () => {
	const [isDark, setIsDark] = createSignal(false);

	onMount(() => {
		// Check localStorage first, then system preference
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			setIsDark(stored === "dark");
		} else {
			setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
		}
	});

	createEffect(() => {
		if (isDark()) {
			document.documentElement.classList.add("dark");
			localStorage.setItem(STORAGE_KEY, "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem(STORAGE_KEY, "light");
		}
	});

	const toggle = () => setIsDark(!isDark());

	return { isDark, toggle };
};
