import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { isPowerUser } from "../suggestions/power-user.ts";
import { resolutionHandlers } from "../suggestions/resolution.ts";
import { zql } from "../zero-schema.gen.ts";
import { newRecord } from "./helpers.ts";

export const createAddTag = defineMutator(
	z.object({
		packageId: z.string(),
		tagId: z.string(),
		justification: z.string().max(500).optional(),
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
		const powerUser = isPowerUser(ctx.roles);

		await tx.mutate.suggestions.insert({
			id: record.id,
			packageId: args.packageId,
			ecosystemId: null,
			accountId: ctx.userID,
			type: "add_tag",
			version: 1,
			payload: { tagId: args.tagId },
			justification: args.justification ?? null,
			status: powerUser ? "approved" : "pending",
			createdAt: record.now,
			updatedAt: record.now,
			resolvedAt: powerUser ? record.now : null,
		});

		if (powerUser) {
			await resolutionHandlers.add_tag({
				tx,
				suggestion: {
					id: record.id,
					packageId: args.packageId,
					ecosystemId: null,
					type: "add_tag",
					version: 1,
					payload: { tagId: args.tagId },
					accountId: ctx.userID,
				},
			});
		}
	},
);

export const createRemoveTag = defineMutator(
	z.object({
		packageId: z.string(),
		tagId: z.string(),
		justification: z.string().max(500).optional(),
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

		// Check tag IS on package (can only remove existing tags)
		const existingTag = await tx.run(
			zql.packageTags
				.where("packageId", args.packageId)
				.where("tagId", args.tagId)
				.one(),
		);
		if (!existingTag) {
			throw new Error("Tag is not on this package");
		}

		// Check no duplicate pending suggestion from this user
		const existingPending = await tx.run(
			zql.suggestions
				.where("packageId", args.packageId)
				.where("accountId", ctx.userID)
				.where("type", "remove_tag")
				.where("status", "pending"),
		);

		for (const suggestion of existingPending) {
			const payload = suggestion.payload as { tagId?: string };
			if (payload.tagId === args.tagId) {
				throw new Error(
					"You already have a pending suggestion to remove this tag",
				);
			}
		}

		const record = newRecord();
		const powerUser = isPowerUser(ctx.roles);

		await tx.mutate.suggestions.insert({
			id: record.id,
			packageId: args.packageId,
			ecosystemId: null,
			accountId: ctx.userID,
			type: "remove_tag",
			version: 1,
			payload: { tagId: args.tagId },
			justification: args.justification ?? null,
			status: powerUser ? "approved" : "pending",
			createdAt: record.now,
			updatedAt: record.now,
			resolvedAt: powerUser ? record.now : null,
		});

		if (powerUser) {
			await resolutionHandlers.remove_tag({
				tx,
				suggestion: {
					id: record.id,
					packageId: args.packageId,
					ecosystemId: null,
					type: "remove_tag",
					version: 1,
					payload: { tagId: args.tagId },
					accountId: ctx.userID,
				},
			});
		}
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
		justification: z.string().max(500).optional(),
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
		const powerUser = isPowerUser(ctx.roles);
		const payload = {
			name: args.name,
			slug,
			description: args.description,
			website: args.website,
		};

		await tx.mutate.suggestions.insert({
			id: record.id,
			packageId: null,
			ecosystemId: null,
			accountId: ctx.userID,
			type: "create_ecosystem",
			version: 1,
			payload,
			justification: args.justification ?? null,
			status: powerUser ? "approved" : "pending",
			createdAt: record.now,
			updatedAt: record.now,
			resolvedAt: powerUser ? record.now : null,
		});

		if (powerUser) {
			await resolutionHandlers.create_ecosystem({
				tx,
				suggestion: {
					id: record.id,
					packageId: null,
					ecosystemId: null,
					type: "create_ecosystem",
					version: 1,
					payload,
					accountId: ctx.userID,
				},
			});
		}
	},
);

export const createAddEcosystemPackage = defineMutator(
	z.object({
		ecosystemId: z.string(),
		packageId: z.string(),
		justification: z.string().max(500).optional(),
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
		const powerUser = isPowerUser(ctx.roles);

		await tx.mutate.suggestions.insert({
			id: record.id,
			packageId: null,
			ecosystemId: args.ecosystemId,
			accountId: ctx.userID,
			type: "add_ecosystem_package",
			version: 1,
			payload: { packageId: args.packageId },
			justification: args.justification ?? null,
			status: powerUser ? "approved" : "pending",
			createdAt: record.now,
			updatedAt: record.now,
			resolvedAt: powerUser ? record.now : null,
		});

		if (powerUser) {
			await resolutionHandlers.add_ecosystem_package({
				tx,
				suggestion: {
					id: record.id,
					packageId: null,
					ecosystemId: args.ecosystemId,
					type: "add_ecosystem_package",
					version: 1,
					payload: { packageId: args.packageId },
					accountId: ctx.userID,
				},
			});
		}
	},
);

export const createAddEcosystemTag = defineMutator(
	z.object({
		ecosystemId: z.string(),
		tagId: z.string(),
		justification: z.string().max(500).optional(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error(
				"Must be logged in to suggest adding a tag to an ecosystem",
			);
		}

		// Validate ecosystem exists
		const ecosystem = await tx.run(
			zql.ecosystems.one().where("id", "=", args.ecosystemId),
		);
		if (!ecosystem) {
			throw new Error("Ecosystem not found");
		}

		// Validate tag exists
		const tag = await tx.run(zql.tags.one().where("id", "=", args.tagId));
		if (!tag) {
			throw new Error("Tag not found");
		}

		// Check tag not already on ecosystem
		const existingTag = await tx.run(
			zql.ecosystemTags
				.where("ecosystemId", args.ecosystemId)
				.where("tagId", args.tagId)
				.one(),
		);
		if (existingTag) {
			throw new Error("This tag is already on this ecosystem");
		}

		// Check no duplicate pending suggestion
		const existingPending = await tx.run(
			zql.suggestions
				.where("ecosystemId", args.ecosystemId)
				.where("type", "add_ecosystem_tag")
				.where("status", "pending"),
		);

		for (const suggestion of existingPending) {
			const payload = suggestion.payload as { tagId?: string };
			if (payload.tagId === args.tagId) {
				throw new Error("A pending suggestion for this tag already exists");
			}
		}

		const record = newRecord();
		const powerUser = isPowerUser(ctx.roles);

		await tx.mutate.suggestions.insert({
			id: record.id,
			packageId: null,
			ecosystemId: args.ecosystemId,
			accountId: ctx.userID,
			type: "add_ecosystem_tag",
			version: 1,
			payload: { tagId: args.tagId },
			justification: args.justification ?? null,
			status: powerUser ? "approved" : "pending",
			createdAt: record.now,
			updatedAt: record.now,
			resolvedAt: powerUser ? record.now : null,
		});

		if (powerUser) {
			await resolutionHandlers.add_ecosystem_tag({
				tx,
				suggestion: {
					id: record.id,
					packageId: null,
					ecosystemId: args.ecosystemId,
					type: "add_ecosystem_tag",
					version: 1,
					payload: { tagId: args.tagId },
					accountId: ctx.userID,
				},
			});
		}
	},
);

export const createRemoveEcosystemTag = defineMutator(
	z.object({
		ecosystemId: z.string(),
		tagId: z.string(),
		justification: z.string().max(500).optional(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error(
				"Must be logged in to suggest removing a tag from an ecosystem",
			);
		}

		// Validate ecosystem exists
		const ecosystem = await tx.run(
			zql.ecosystems.one().where("id", "=", args.ecosystemId),
		);
		if (!ecosystem) {
			throw new Error("Ecosystem not found");
		}

		// Validate tag exists
		const tag = await tx.run(zql.tags.one().where("id", "=", args.tagId));
		if (!tag) {
			throw new Error("Tag not found");
		}

		// Check tag IS on ecosystem (can only remove existing tags)
		const existingTag = await tx.run(
			zql.ecosystemTags
				.where("ecosystemId", args.ecosystemId)
				.where("tagId", args.tagId)
				.one(),
		);
		if (!existingTag) {
			throw new Error("This tag is not on this ecosystem");
		}

		// Check no duplicate pending suggestion
		const existingPending = await tx.run(
			zql.suggestions
				.where("ecosystemId", args.ecosystemId)
				.where("type", "remove_ecosystem_tag")
				.where("status", "pending"),
		);

		for (const suggestion of existingPending) {
			const payload = suggestion.payload as { tagId?: string };
			if (payload.tagId === args.tagId) {
				throw new Error(
					"A pending suggestion to remove this tag already exists",
				);
			}
		}

		const record = newRecord();
		const powerUser = isPowerUser(ctx.roles);

		await tx.mutate.suggestions.insert({
			id: record.id,
			packageId: null,
			ecosystemId: args.ecosystemId,
			accountId: ctx.userID,
			type: "remove_ecosystem_tag",
			version: 1,
			payload: { tagId: args.tagId },
			justification: args.justification ?? null,
			status: powerUser ? "approved" : "pending",
			createdAt: record.now,
			updatedAt: record.now,
			resolvedAt: powerUser ? record.now : null,
		});

		if (powerUser) {
			await resolutionHandlers.remove_ecosystem_tag({
				tx,
				suggestion: {
					id: record.id,
					packageId: null,
					ecosystemId: args.ecosystemId,
					type: "remove_ecosystem_tag",
					version: 1,
					payload: { tagId: args.tagId },
					accountId: ctx.userID,
				},
			});
		}
	},
);
