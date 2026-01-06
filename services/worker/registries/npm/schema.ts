import { z } from "@package/common";

/**
 * Zod schemas for npm registry API responses.
 * If npm changes their API, validation fails and we can alert.
 */

// Some packages have malformed deps (string instead of object) - accept both
const depsField = z
	.union([z.record(z.string(), z.string()), z.string()])
	.optional();

export const NpmVersionSchema = z.object({
	version: z.string(),
	dependencies: depsField,
	devDependencies: depsField,
	peerDependencies: depsField,
	optionalDependencies: depsField,
});

export const NpmPackageSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	// These fields have inconsistent types in legacy packages - accept anything
	homepage: z.unknown().optional(),
	license: z.unknown().optional(),
	repository: z.unknown().optional(),
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
