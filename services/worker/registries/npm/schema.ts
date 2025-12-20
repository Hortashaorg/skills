import { z } from "zod";

/**
 * Zod schemas for npm registry API responses.
 * If npm changes their API, validation fails and we can alert.
 */

export const NpmVersionSchema = z.object({
	version: z.string(),
	dependencies: z.record(z.string(), z.string()).optional(),
	devDependencies: z.record(z.string(), z.string()).optional(),
	peerDependencies: z.record(z.string(), z.string()).optional(),
	optionalDependencies: z.record(z.string(), z.string()).optional(),
});

export const NpmPackageSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	homepage: z.string().optional(),
	license: z.union([z.string(), z.object({ type: z.string() })]).optional(),
	repository: z
		.union([
			z.string(),
			z.object({ type: z.string().optional(), url: z.string() }),
		])
		.optional(),
	"dist-tags": z.looseObject({
		latest: z.string(),
	}),
	versions: z.record(z.string(), NpmVersionSchema),
	time: z.record(z.string(), z.string()),
});

export type NpmVersionResponse = z.infer<typeof NpmVersionSchema>;
export type NpmPackageResponse = z.infer<typeof NpmPackageSchema>;

// Re-export schemas for runtime use
export const schemas = {
	version: NpmVersionSchema,
	package: NpmPackageSchema,
};
