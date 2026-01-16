import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";
import { newRecord } from "./helpers.ts";

export const createAddTag = defineMutator(
	z.object({
		packageId: z.string(),
		tagId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to create a suggestion");
		}

		// Validate package exists
		const pkg = await tx.run(
			zql.packages.one().where("id", "=", args.packageId),
		);
		if (!pkg) {
			throw new Error("Package not found");
		}

		// Validate tag exists
		const tag = await tx.run(zql.tags.one().where("id", "=", args.tagId));
		if (!tag) {
			throw new Error("Tag not found");
		}

		// Check tag not already on package
		const existingTag = await tx.run(
			zql.packageTags
				.where("packageId", args.packageId)
				.where("tagId", args.tagId)
				.one(),
		);
		if (existingTag) {
			throw new Error("Tag is already applied to this package");
		}

		// Check no duplicate pending suggestion from this user
		const existingPending = await tx.run(
			zql.suggestions
				.where("packageId", args.packageId)
				.where("accountId", ctx.userID)
				.where("type", "add_tag")
				.where("status", "pending"),
		);

		for (const suggestion of existingPending) {
			const payload = suggestion.payload as { tagId?: string };
			if (payload.tagId === args.tagId) {
				throw new Error("You already have a pending suggestion for this tag");
			}
		}

		const record = newRecord();

		await tx.mutate.suggestions.insert({
			id: record.id,
			packageId: args.packageId,
			ecosystemId: null,
			accountId: ctx.userID,
			type: "add_tag",
			version: 1,
			payload: { tagId: args.tagId },
			status: "pending",
			createdAt: record.now,
			updatedAt: record.now,
			resolvedAt: null,
		});
	},
);

const slugify = (text: string): string =>
	text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");

export const createCreateEcosystem = defineMutator(
	z.object({
		name: z.string().min(1).max(100),
		description: z.string().max(500).optional(),
		website: z.string().url().optional(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to suggest an ecosystem");
		}

		const slug = slugify(args.name);

		// Check no existing ecosystem with this slug
		const existingEcosystem = await tx.run(
			zql.ecosystems.where("slug", slug).one(),
		);
		if (existingEcosystem) {
			throw new Error("An ecosystem with this name already exists");
		}

		// Check no duplicate pending suggestion for same slug
		const existingPending = await tx.run(
			zql.suggestions
				.where("type", "create_ecosystem")
				.where("status", "pending"),
		);

		for (const suggestion of existingPending) {
			const payload = suggestion.payload as { slug?: string };
			if (payload.slug === slug) {
				throw new Error(
					"A pending suggestion for this ecosystem already exists",
				);
			}
		}

		const record = newRecord();

		await tx.mutate.suggestions.insert({
			id: record.id,
			packageId: null,
			ecosystemId: null,
			accountId: ctx.userID,
			type: "create_ecosystem",
			version: 1,
			payload: {
				name: args.name,
				slug,
				description: args.description,
				website: args.website,
			},
			status: "pending",
			createdAt: record.now,
			updatedAt: record.now,
			resolvedAt: null,
		});
	},
);

export const createAddEcosystemPackage = defineMutator(
	z.object({
		ecosystemId: z.string(),
		packageId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error(
				"Must be logged in to suggest adding a package to an ecosystem",
			);
		}

		// Validate ecosystem exists
		const ecosystem = await tx.run(
			zql.ecosystems.one().where("id", "=", args.ecosystemId),
		);
		if (!ecosystem) {
			throw new Error("Ecosystem not found");
		}

		// Validate package exists
		const pkg = await tx.run(
			zql.packages.one().where("id", "=", args.packageId),
		);
		if (!pkg) {
			throw new Error("Package not found");
		}

		// Check package not already in ecosystem
		const existingLink = await tx.run(
			zql.ecosystemPackages
				.where("ecosystemId", args.ecosystemId)
				.where("packageId", args.packageId)
				.one(),
		);
		if (existingLink) {
			throw new Error("Package is already in this ecosystem");
		}

		// Check no duplicate pending suggestion
		const existingPending = await tx.run(
			zql.suggestions
				.where("ecosystemId", args.ecosystemId)
				.where("type", "add_ecosystem_package")
				.where("status", "pending"),
		);

		for (const suggestion of existingPending) {
			const payload = suggestion.payload as { packageId?: string };
			if (payload.packageId === args.packageId) {
				throw new Error("A pending suggestion for this package already exists");
			}
		}

		const record = newRecord();

		await tx.mutate.suggestions.insert({
			id: record.id,
			packageId: null,
			ecosystemId: args.ecosystemId,
			accountId: ctx.userID,
			type: "add_ecosystem_package",
			version: 1,
			payload: { packageId: args.packageId },
			status: "pending",
			createdAt: record.now,
			updatedAt: record.now,
			resolvedAt: null,
		});
	},
);
