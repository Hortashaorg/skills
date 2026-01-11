import { z } from "@package/common";

/**
 * Zod schemas for Homebrew API responses.
 * API: https://formulae.brew.sh/api/formula/{name}.json
 */

export const HomebrewVersionsSchema = z.object({
	stable: z.string().nullable(),
	head: z.string().nullable().optional(),
});

export const HomebrewFormulaSchema = z.object({
	name: z.string(),
	full_name: z.string().optional(),
	desc: z.string().nullable(),
	homepage: z.string().nullable(),
	license: z.string().nullable(),
	versions: HomebrewVersionsSchema,
	revision: z.number().optional(),
	dependencies: z.array(z.string()).optional(),
	build_dependencies: z.array(z.string()).optional(),
	test_dependencies: z.array(z.string()).optional(),
	optional_dependencies: z.array(z.string()).optional(),
	recommended_dependencies: z.array(z.string()).optional(),
	deprecated: z.boolean().optional(),
	disabled: z.boolean().optional(),
});

export type HomebrewVersions = z.infer<typeof HomebrewVersionsSchema>;
export type HomebrewFormula = z.infer<typeof HomebrewFormulaSchema>;

export const schemas = {
	formula: HomebrewFormulaSchema,
};
