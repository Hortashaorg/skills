/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
	);
}
if (!root) throw new Error("Root element not found");

render(() => <App />, root);
