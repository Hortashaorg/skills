import { defineConfig } from "drizzle-kit";
import { environment } from "./environment.ts";

export default defineConfig({
	out: "./drizzle",
	schema: "./db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: environment.ZERO_UPSTREAM_DB,
	},
	casing: "snake_case",
});
