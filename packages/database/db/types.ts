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
	actorTypeEnum,
	auditActionEnum,
	dependencyTypeEnum,
	packageRequestStatusEnum,
	registryEnum,
} from "./schema.ts";

// Infer union types from Drizzle enums
export type Registry = (typeof registryEnum.enumValues)[number];
export type DependencyType = (typeof dependencyTypeEnum.enumValues)[number];
export type PackageRequestStatus = (typeof packageRequestStatusEnum.enumValues)[number];
export type AuditAction = (typeof auditActionEnum.enumValues)[number];
export type ActorType = (typeof actorTypeEnum.enumValues)[number];

// Re-export enum values for Zod validators
// Use: z.enum(enums.registry)
export const enums = {
	registry: registryEnum.enumValues,
	dependencyType: dependencyTypeEnum.enumValues,
	packageRequestStatus: packageRequestStatusEnum.enumValues,
	auditAction: auditActionEnum.enumValues,
	actorType: actorTypeEnum.enumValues,
} as const;
