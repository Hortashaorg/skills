import { relations } from "drizzle-orm";
import { account } from "./account.ts";
import {
	contributionEvents,
	contributionScores,
	notifications,
	suggestions,
	suggestionVotes,
} from "./curation.ts";
import {
	ecosystemPackages,
	ecosystems,
	ecosystemTags,
	ecosystemUpvotes,
	projectEcosystems,
} from "./ecosystems.ts";
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
	ecosystemUpvotes: many(ecosystemUpvotes),
	suggestions: many(suggestions),
	suggestionVotes: many(suggestionVotes),
	contributionEvents: many(contributionEvents),
	contributionScore: one(contributionScores, {
		fields: [account.id],
		references: [contributionScores.accountId],
	}),
	notifications: many(notifications),
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
	ecosystemPackages: many(ecosystemPackages),
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
	ecosystemTags: many(ecosystemTags),
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
	projectEcosystems: many(projectEcosystems),
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
	ecosystem: one(ecosystems, {
		fields: [suggestions.ecosystemId],
		references: [ecosystems.id],
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

export const notificationsRelations = relations(notifications, ({ one }) => ({
	account: one(account, {
		fields: [notifications.accountId],
		references: [account.id],
	}),
}));

export const ecosystemsRelations = relations(ecosystems, ({ many }) => ({
	ecosystemPackages: many(ecosystemPackages),
	ecosystemTags: many(ecosystemTags),
	upvotes: many(ecosystemUpvotes),
	projectEcosystems: many(projectEcosystems),
	suggestions: many(suggestions),
}));

export const ecosystemPackagesRelations = relations(
	ecosystemPackages,
	({ one }) => ({
		ecosystem: one(ecosystems, {
			fields: [ecosystemPackages.ecosystemId],
			references: [ecosystems.id],
		}),
		package: one(packages, {
			fields: [ecosystemPackages.packageId],
			references: [packages.id],
		}),
	}),
);

export const ecosystemTagsRelations = relations(ecosystemTags, ({ one }) => ({
	ecosystem: one(ecosystems, {
		fields: [ecosystemTags.ecosystemId],
		references: [ecosystems.id],
	}),
	tag: one(tags, {
		fields: [ecosystemTags.tagId],
		references: [tags.id],
	}),
}));

export const ecosystemUpvotesRelations = relations(
	ecosystemUpvotes,
	({ one }) => ({
		ecosystem: one(ecosystems, {
			fields: [ecosystemUpvotes.ecosystemId],
			references: [ecosystems.id],
		}),
		account: one(account, {
			fields: [ecosystemUpvotes.accountId],
			references: [account.id],
		}),
	}),
);

export const projectEcosystemsRelations = relations(
	projectEcosystems,
	({ one }) => ({
		project: one(projects, {
			fields: [projectEcosystems.projectId],
			references: [projects.id],
		}),
		ecosystem: one(ecosystems, {
			fields: [projectEcosystems.ecosystemId],
			references: [ecosystems.id],
		}),
	}),
);
