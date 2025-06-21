/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import "./index.css";
import { createZero, schema } from "@package/database/client";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
    );
}
if (!root) throw new Error("Root element not found");

const z = createZero({
    userID: "anon",
    server: "http://localhost:4848",
    schema,
});

render(() => <App z={z} />, root);
