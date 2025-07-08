import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
	"*",
	cors({
		origin: "http://localhost:4321",
		credentials: true,
	}),
);

app.get("/login", (c) => {
	console.log("yolo");
	return c.text("Login");
});

serve({
	fetch: app.fetch,
	port: 4000,
});
console.log("Server started on port 4000");
