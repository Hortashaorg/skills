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
	package: z.string(),
	version: z.string(),
	yanked: z.boolean().optional(),
	usesNpm: z.boolean().optional(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
	exports: z.record(z.string(), z.string()).optional(),
});

// Dependencies come from a separate endpoint: /versions/{version}/dependencies
export const JsrDependencySchema = z.object({
	kind: z.enum(["npm", "jsr"]),
	name: z.string(),
	constraint: z.string(),
	path: z.string().optional(),
});

export const JsrDependenciesSchema = z.array(JsrDependencySchema);

export type JsrPackageResponse = z.infer<typeof JsrPackageSchema>;
export type JsrVersionResponse = z.infer<typeof JsrVersionSchema>;
export type JsrDependency = z.infer<typeof JsrDependencySchema>;

export const schemas = {
	package: JsrPackageSchema,
	version: JsrVersionSchema,
	dependencies: JsrDependenciesSchema,
};
