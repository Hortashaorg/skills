import { z } from "@package/common";

/**
 * Zod schemas for Arch Linux package API responses.
 * API: https://archlinux.org/packages/search/json/?name={name}
 */

export const ArchPackageSchema = z.object({
	pkgname: z.string(),
	pkgbase: z.string(),
	repo: z.string(),
	arch: z.string(),
	pkgver: z.string(),
	pkgrel: z.string(),
	epoch: z.number(),
	pkgdesc: z.string().nullable(),
	url: z.string().nullable(),
	filename: z.string(),
	compressed_size: z.number(),
	installed_size: z.number(),
	build_date: z.string(),
	last_update: z.string(),
	flag_date: z.string().nullable(),
	maintainers: z.array(z.string()),
	packager: z.string(),
	licenses: z.array(z.string()),
	depends: z.array(z.string()).optional(),
	optdepends: z.array(z.string()).optional(),
	makedepends: z.array(z.string()).optional(),
	checkdepends: z.array(z.string()).optional(),
	conflicts: z.array(z.string()).optional(),
	provides: z.array(z.string()).optional(),
	replaces: z.array(z.string()).optional(),
	groups: z.array(z.string()).optional(),
});

export const ArchSearchResponseSchema = z.object({
	version: z.number(),
	limit: z.number(),
	valid: z.boolean(),
	results: z.array(ArchPackageSchema),
	num_pages: z.number().optional(),
	page: z.number().optional(),
});

export type ArchPackage = z.infer<typeof ArchPackageSchema>;
export type ArchSearchResponse = z.infer<typeof ArchSearchResponseSchema>;

export const schemas = {
	package: ArchPackageSchema,
	searchResponse: ArchSearchResponseSchema,
};
