import { z } from "@package/common";

/**
 * Zod schemas for JSR registry API responses.
 * API docs: https://jsr.io/docs/api
 */

export const JsrGithubRepoSchema = z.object({
	owner: z.string(),
	name: z.string(),
});

export const JsrRuntimeCompatSchema = z.object({
	browser: z.boolean().optional(),
	deno: z.boolean().optional(),
	node: z.boolean().optional(),
	workerd: z.boolean().optional(),
	bun: z.boolean().optional(),
});

export const JsrPackageSchema = z.object({
	scope: z.string(),
	name: z.string(),
	description: z.string().optional(),
	githubRepository: JsrGithubRepoSchema.nullable().optional(),
	runtimeCompat: JsrRuntimeCompatSchema.optional(),
	score: z.number().nullable().optional(),
	latestVersion: z.string().nullable().optional(),
	versionCount: z.number().optional(),
	dependencyCount: z.number().optional(),
	dependentCount: z.number().optional(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

export const JsrVersionSchema = z.object({
	scope: z.string(),
	name: z.string(),
	version: z.string(),
	yanked: z.boolean().optional(),
	usesNpm: z.boolean().optional(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
	exports: z.record(z.string(), z.string()).optional(),
	// Dependencies are in format: "jsr:@scope/name": "^1.0.0" or "npm:lodash": "^4.0.0"
	dependencies: z.record(z.string(), z.string()).optional(),
});

export type JsrPackageResponse = z.infer<typeof JsrPackageSchema>;
export type JsrVersionResponse = z.infer<typeof JsrVersionSchema>;

export const schemas = {
	package: JsrPackageSchema,
	version: JsrVersionSchema,
};
