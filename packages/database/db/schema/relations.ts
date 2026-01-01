import { relations } from "drizzle-orm";
import { account } from "./account.ts";
import { auditLog } from "./audit.ts";
import {
	channelDependencies,
	packageFetches,
	packageReleaseChannels,
	packages,
	packageTags,
	packageUpvotes,
	tags,
} from "./packages.ts";
import { projectPackages, projects } from "./projects.ts";

export const accountRelations = relations(account, ({ many }) => ({
	projects: many(projects),
	upvotes: many(packageUpvotes),
}));

export const packagesRelations = relations(packages, ({ many }) => ({
	releaseChannels: many(packageReleaseChannels),
	channelDependents: many(channelDependencies, {
		relationName: "dependencyPackage",
	}),
	packageTags: many(packageTags),
	fetches: many(packageFetches),
	upvotes: many(packageUpvotes),
	projectPackages: many(projectPackages),
}));

export const packageFetchesRelations = relations(packageFetches, ({ one }) => ({
	package: one(packages, {
		fields: [packageFetches.packageId],
		references: [packages.id],
	}),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
	packageTags: many(packageTags),
}));

export const packageTagsRelations = relations(packageTags, ({ one }) => ({
	package: one(packages, {
		fields: [packageTags.packageId],
		references: [packages.id],
	}),
	tag: one(tags, {
		fields: [packageTags.tagId],
		references: [tags.id],
	}),
}));

export const packageUpvotesRelations = relations(packageUpvotes, ({ one }) => ({
	package: one(packages, {
		fields: [packageUpvotes.packageId],
		references: [packages.id],
	}),
	account: one(account, {
		fields: [packageUpvotes.accountId],
		references: [account.id],
	}),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
	actor: one(account, {
		fields: [auditLog.actorId],
		references: [account.id],
	}),
}));

export const packageReleaseChannelsRelations = relations(
	packageReleaseChannels,
	({ one, many }) => ({
		package: one(packages, {
			fields: [packageReleaseChannels.packageId],
			references: [packages.id],
		}),
		dependencies: many(channelDependencies),
	}),
);

export const channelDependenciesRelations = relations(
	channelDependencies,
	({ one }) => ({
		channel: one(packageReleaseChannels, {
			fields: [channelDependencies.channelId],
			references: [packageReleaseChannels.id],
		}),
		dependencyPackage: one(packages, {
			fields: [channelDependencies.dependencyPackageId],
			references: [packages.id],
			relationName: "dependencyPackage",
		}),
	}),
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
	account: one(account, {
		fields: [projects.accountId],
		references: [account.id],
	}),
	projectPackages: many(projectPackages),
}));

export const projectPackagesRelations = relations(projectPackages, ({ one }) => ({
	project: one(projects, {
		fields: [projectPackages.projectId],
		references: [projects.id],
	}),
	package: one(packages, {
		fields: [projectPackages.packageId],
		references: [packages.id],
	}),
}));
