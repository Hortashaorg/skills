/**
 * Idempotent migration script: seeds project_statuses and project_members
 * for existing projects that don't already have them.
 *
 * Safe to run multiple times — checks for existing data before inserting.
 *
 * Usage: npx tsx scripts/seed-project-defaults.ts
 */

import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema.ts";

const DATABASE_URL = process.env.ZERO_UPSTREAM_DB;
if (!DATABASE_URL) {
	console.error("ZERO_UPSTREAM_DB environment variable is required");
	process.exit(1);
}

const sqlClient = postgres(DATABASE_URL);
const db = drizzle(sqlClient, { schema, casing: "snake_case" });

const DEFAULT_STATUSES = [
	{ status: "evaluating" as const, position: 0 },
	{ status: "adopted" as const, position: 1 },
	{ status: "dropped" as const, position: 2 },
];

async function seedProjectStatuses() {
	const allProjects = await db
		.select({ id: schema.projects.id })
		.from(schema.projects);

	console.log(`Found ${allProjects.length} projects`);

	let statusesCreated = 0;
	let statusesSkipped = 0;

	for (const project of allProjects) {
		// Get existing statuses for this project
		const existing = await db
			.select({ status: schema.projectStatuses.status })
			.from(schema.projectStatuses)
			.where(eq(schema.projectStatuses.projectId, project.id));

		const existingSet = new Set(existing.map((e) => e.status));

		// 1. Seed default statuses if missing
		for (const def of DEFAULT_STATUSES) {
			if (existingSet.has(def.status)) {
				statusesSkipped++;
				continue;
			}

			await db.insert(schema.projectStatuses).values({
				id: crypto.randomUUID(),
				projectId: project.id,
				status: def.status,
				position: def.position,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			existingSet.add(def.status);
			statusesCreated++;
		}

		// 2. Check for statuses used by cards but not yet in projectStatuses
		const packageStatuses = await db
			.selectDistinct({ status: schema.projectPackages.status })
			.from(schema.projectPackages)
			.where(eq(schema.projectPackages.projectId, project.id));

		const ecosystemStatuses = await db
			.selectDistinct({ status: schema.projectEcosystems.status })
			.from(schema.projectEcosystems)
			.where(eq(schema.projectEcosystems.projectId, project.id));

		const cardStatuses = new Set([
			...packageStatuses.map((r) => r.status),
			...ecosystemStatuses.map((r) => r.status),
		]);

		// Get current max position for appending
		const maxPosResult = await db
			.select({
				maxPos: sql<number>`coalesce(max(${schema.projectStatuses.position}), -1)`,
			})
			.from(schema.projectStatuses)
			.where(eq(schema.projectStatuses.projectId, project.id));

		let nextPosition = (maxPosResult[0]?.maxPos ?? -1) + 1;

		for (const status of cardStatuses) {
			if (existingSet.has(status)) continue;

			await db.insert(schema.projectStatuses).values({
				id: crypto.randomUUID(),
				projectId: project.id,
				status,
				position: nextPosition++,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			existingSet.add(status);
			statusesCreated++;
		}
	}

	console.log(
		`Project statuses: ${statusesCreated} created, ${statusesSkipped} already existed`,
	);
}

async function seedProjectMembers() {
	const allProjects = await db
		.select({ id: schema.projects.id, accountId: schema.projects.accountId })
		.from(schema.projects);

	let membersCreated = 0;
	let membersSkipped = 0;

	for (const project of allProjects) {
		// Check if owner membership already exists
		const existing = await db
			.select({ id: schema.projectMembers.id })
			.from(schema.projectMembers)
			.where(
				and(
					eq(schema.projectMembers.projectId, project.id),
					eq(schema.projectMembers.accountId, project.accountId),
				),
			);

		if (existing.length > 0) {
			membersSkipped++;
			continue;
		}

		await db.insert(schema.projectMembers).values({
			id: crypto.randomUUID(),
			projectId: project.id,
			accountId: project.accountId,
			role: "owner",
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		membersCreated++;
	}

	console.log(
		`Project members: ${membersCreated} created, ${membersSkipped} already existed`,
	);
}

async function main() {
	console.log("Seeding project defaults...\n");

	await seedProjectStatuses();
	await seedProjectMembers();

	console.log("\nDone.");
	await sqlClient.end();
}

main().catch((err) => {
	console.error("Migration failed:", err);
	sqlClient.end().then(() => process.exit(1));
});
