/**
 * Inferred types from Drizzle schema.
 * These are the single source of truth - DO NOT duplicate enum values elsewhere.
 *
 * Usage in Zod validators:
 *   import { registryEnum } from "./schema.ts";
 *   z.enum(registryEnum.enumValues)
 *
 * Usage as TypeScript types:
 *   import type { Registry, DependencyType } from "./types.ts";
 */

import {
	contributionEventTypeEnum,
	dependencyTypeEnum,
	fetchStatusEnum,
	notificationTypeEnum,
	packageStatusEnum,
	registryEnum,
	suggestionStatusEnum,
	suggestionTypeEnum,
	voteEnum,
} from "./schema.ts";

// Infer union types from Drizzle enums
export type Registry = (typeof registryEnum.enumValues)[number];
export type DependencyType = (typeof dependencyTypeEnum.enumValues)[number];
export type FetchStatus = (typeof fetchStatusEnum.enumValues)[number];
export type PackageStatus = (typeof packageStatusEnum.enumValues)[number];
export type SuggestionType = (typeof suggestionTypeEnum.enumValues)[number];
export type SuggestionStatus = (typeof suggestionStatusEnum.enumValues)[number];
export type Vote = (typeof voteEnum.enumValues)[number];
export type ContributionEventType =
	(typeof contributionEventTypeEnum.enumValues)[number];
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];

// Re-export enum values for Zod validators
// Use: z.enum(enums.registry)
export const enums = {
	registry: registryEnum.enumValues,
	dependencyType: dependencyTypeEnum.enumValues,
	fetchStatus: fetchStatusEnum.enumValues,
	packageStatus: packageStatusEnum.enumValues,
	suggestionType: suggestionTypeEnum.enumValues,
	suggestionStatus: suggestionStatusEnum.enumValues,
	vote: voteEnum.enumValues,
	contributionEventType: contributionEventTypeEnum.enumValues,
	notificationType: notificationTypeEnum.enumValues,
} as const;
