import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url:
			process.env.POSTGRES_URL ?? "postgresql://root:root@localhost:5432/root",
	},
	casing: "snake_case",
});
