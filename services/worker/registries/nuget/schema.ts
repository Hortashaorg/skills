import { z } from "@package/common";

/**
 * Zod schemas for NuGet registry API responses.
 * API docs: https://learn.microsoft.com/en-us/nuget/api/overview
 */

export const NuGetDependencySchema = z.object({
	"@id": z.string(),
	"@type": z.literal("PackageDependency"),
	id: z.string(),
	range: z.string().optional(),
	registration: z.string().optional(),
});

export const NuGetDependencyGroupSchema = z.object({
	"@id": z.string(),
	"@type": z.literal("PackageDependencyGroup"),
	targetFramework: z.string().optional(),
	dependencies: z.array(NuGetDependencySchema).optional(),
});

export const NuGetCatalogEntrySchema = z.object({
	"@id": z.string(),
	"@type": z.string(),
	id: z.string(),
	version: z.string(),
	authors: z.union([z.string(), z.array(z.string())]).optional(),
	description: z.string().optional(),
	iconUrl: z.string().optional(),
	licenseUrl: z.string().optional(),
	projectUrl: z.string().optional(),
	published: z.string().optional(),
	listed: z.boolean().optional(),
	dependencyGroups: z.array(NuGetDependencyGroupSchema).optional(),
});

export const NuGetPackageItemSchema = z.object({
	"@id": z.string(),
	"@type": z.literal("Package"),
	catalogEntry: NuGetCatalogEntrySchema,
	packageContent: z.string(),
	registration: z.string(),
});

export const NuGetPageSchema = z.object({
	"@id": z.string(),
	"@type": z.literal("catalog:CatalogPage"),
	count: z.number(),
	items: z.array(NuGetPackageItemSchema).optional(),
});

export const NuGetRegistrationSchema = z.object({
	"@id": z.string(),
	count: z.number(),
	items: z.array(NuGetPageSchema),
});

export type NuGetDependency = z.infer<typeof NuGetDependencySchema>;
export type NuGetDependencyGroup = z.infer<typeof NuGetDependencyGroupSchema>;
export type NuGetCatalogEntry = z.infer<typeof NuGetCatalogEntrySchema>;
export type NuGetPackageItem = z.infer<typeof NuGetPackageItemSchema>;
export type NuGetPage = z.infer<typeof NuGetPageSchema>;
export type NuGetRegistration = z.infer<typeof NuGetRegistrationSchema>;

export const schemas = {
	registration: NuGetRegistrationSchema,
	page: NuGetPageSchema,
	catalogEntry: NuGetCatalogEntrySchema,
};
