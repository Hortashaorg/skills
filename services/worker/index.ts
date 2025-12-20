/**
 * TechGarden Worker
 *
 * Processes pending package requests by fetching package metadata
 * from registries and storing results in the database.
 *
 * Runs as a Kubernetes CronJob - processes all pending requests then exits.
 */

import { npm, type PackageData } from "./registries/index.ts";

async function main() {
	console.log("Worker starting...\n");

	const packages = ["ky", "hono", "solid-js", "zod", "nonexistent-package-xyz-123"];

	console.log(`Fetching ${packages.length} packages from npm...`);
	const results = await npm.getPackages(packages);

	for (const [name, result] of results) {
		if (result instanceof npm.NpmSchemaError) {
			console.log(`\n${name}: SCHEMA ERROR`);
			console.log(`  ${result.message}`);
			console.log(`  Registry: ${result.registryName}`);
		} else if (result instanceof Error) {
			console.log(`\n${name}: ERROR - ${result.message}`);
		} else {
			printPackage(result);
		}
	}

	console.log("\nWorker finished.");
}

function printPackage(pkg: PackageData) {
	console.log(`\n${pkg.name}:`);
	console.log(`  Description: ${pkg.description?.slice(0, 50)}...`);
	console.log(`  Homepage: ${pkg.homepage}`);
	console.log(`  Repository: ${pkg.repository}`);
	console.log(`  Versions: ${pkg.versions.length}`);

	// Show latest version (last in array)
	const latest = pkg.versions[pkg.versions.length - 1];
	if (latest) {
		console.log(`  Latest: ${latest.version} (${latest.publishedAt.toISOString().split("T")[0]})`);
		console.log(`  Dependencies: ${latest.dependencies.length}`);

		// Show first few deps by type
		const byType = {
			runtime: latest.dependencies.filter((d) => d.type === "runtime"),
			dev: latest.dependencies.filter((d) => d.type === "dev"),
			peer: latest.dependencies.filter((d) => d.type === "peer"),
		};

		if (byType.runtime.length > 0) {
			console.log(`    runtime: ${byType.runtime.map((d) => d.name).slice(0, 3).join(", ")}`);
		}
		if (byType.dev.length > 0) {
			console.log(`    dev: ${byType.dev.length} packages`);
		}
		if (byType.peer.length > 0) {
			console.log(`    peer: ${byType.peer.map((d) => d.name).join(", ")}`);
		}
	}
}

main().catch((error) => {
	console.error("Worker failed:", error);
	process.exit(1);
});
