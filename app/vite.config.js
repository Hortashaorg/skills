import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [solid()],
	server: {
		port: 5432,
		host: "0.0.0.0",
	},
	build: {
		outDir: "dist",
	},
	esbuild: {
		target: "esnext",
	},
});
