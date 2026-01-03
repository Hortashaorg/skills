import { relations } from "drizzle-orm";
import { account } from "./account.ts";
import {
	contributionEvents,
	contributionScores,
	suggestions,
	suggestionVotes,
} from "./curation.ts";
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

export const accountRelations = relations(account, ({ many, one }) => ({
	projects: many(projects),
	upvotes: many(packageUpvotes),
	suggestions: many(suggestions),
	suggestionVotes: many(suggestionVotes),
	contributionEvents: many(contributionEvents),
	contributionScore: one(contributionScores, {
		fields: [account.id],
		references: [contributionScores.accountId],
	}),
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
	suggestions: many(suggestions),
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

export const projectPackagesRelations = relations(
	projectPackages,
	({ one }) => ({
		project: one(projects, {
			fields: [projectPackages.projectId],
			references: [projects.id],
		}),
		package: one(packages, {
			fields: [projectPackages.packageId],
			references: [packages.id],
		}),
	}),
);

export const suggestionsRelations = relations(suggestions, ({ one, many }) => ({
	package: one(packages, {
		fields: [suggestions.packageId],
		references: [packages.id],
	}),
	account: one(account, {
		fields: [suggestions.accountId],
		references: [account.id],
	}),
	votes: many(suggestionVotes),
}));

export const suggestionVotesRelations = relations(
	suggestionVotes,
	({ one }) => ({
		suggestion: one(suggestions, {
			fields: [suggestionVotes.suggestionId],
			references: [suggestions.id],
		}),
		account: one(account, {
			fields: [suggestionVotes.accountId],
			references: [account.id],
		}),
	}),
);

export const contributionScoresRelations = relations(
	contributionScores,
	({ one }) => ({
		account: one(account, {
			fields: [contributionScores.accountId],
			references: [account.id],
		}),
	}),
);

export const contributionEventsRelations = relations(
	contributionEvents,
	({ one }) => ({
		account: one(account, {
			fields: [contributionEvents.accountId],
			references: [account.id],
		}),
		suggestion: one(suggestions, {
			fields: [contributionEvents.suggestionId],
			references: [suggestions.id],
		}),
	}),
);
