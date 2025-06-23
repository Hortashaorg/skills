import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono().basePath("/api");

app.get("/login", (c) => c.text("Login"));

serve({
    fetch: app.fetch,
    port: 4000,
});
