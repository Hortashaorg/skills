/**
 * Server-only batch resolution of suggestion display data.
 * Fetches entity names from the DB and builds FormatContext for formatDisplay.
 */

import { db, dbSchema, inArray } from "../server.ts";
import type { FormatContext, SuggestionDisplay } from "./types/definition.ts";
import { formatDisplay, getSchema, getSuggestionType } from "./types/index.ts";
import { buildEcosystemUrl, buildPackageUrl } from "./urls.ts";

interface SuggestionInput {
	id: string;
	type: string;
	version: number;
	payload: unknown;
	packageId: string | null;
	ecosystemId: string | null;
}

export async function resolveDisplayBatch(
	suggestions: SuggestionInput[],
): Promise<Record<string, SuggestionDisplay>> {
	const tagIds = new Set<string>();
	const packageIds = new Set<string>();
	const ecosystemIds = new Set<string>();

	for (const s of suggestions) {
		if (s.packageId) packageIds.add(s.packageId);
		if (s.ecosystemId) ecosystemIds.add(s.ecosystemId);

		const typeDef = getSuggestionType(s.type);
		if (!typeDef) continue;
		const schema = getSchema(s.type, s.version);
		if (!schema) continue;
		const parsed = schema.safeParse(s.payload);
		if (!parsed.success) continue;
		const payload = parsed.data as Record<string, unknown>;

		if (typeof payload.tagId === "string") tagIds.add(payload.tagId);
		if (typeof payload.packageId === "string")
			packageIds.add(payload.packageId);
	}

	const [tags, packages, ecosystems] = await Promise.all([
		tagIds.size > 0
			? db
					.select({ id: dbSchema.tags.id, name: dbSchema.tags.name })
					.from(dbSchema.tags)
					.where(inArray(dbSchema.tags.id, [...tagIds]))
			: [],
		packageIds.size > 0
			? db
					.select({
						id: dbSchema.packages.id,
						name: dbSchema.packages.name,
						registry: dbSchema.packages.registry,
					})
					.from(dbSchema.packages)
					.where(inArray(dbSchema.packages.id, [...packageIds]))
			: [],
		ecosystemIds.size > 0
			? db
					.select({
						id: dbSchema.ecosystems.id,
						name: dbSchema.ecosystems.name,
						slug: dbSchema.ecosystems.slug,
					})
					.from(dbSchema.ecosystems)
					.where(inArray(dbSchema.ecosystems.id, [...ecosystemIds]))
			: [],
	]);

	const ctx: FormatContext = {
		tags: new Map(tags.map((t) => [t.id, { name: t.name }])),
		packages: new Map(
			packages.map((p) => [p.id, { name: p.name, registry: p.registry }]),
		),
		ecosystems: new Map(
			ecosystems.map((e) => [e.id, { name: e.name, slug: e.slug }]),
		),
	};

	const result: Record<string, SuggestionDisplay> = {};

	for (const s of suggestions) {
		const display = formatDisplay(s.type, s.payload, s.version, ctx);

		const typeDef = getSuggestionType(s.type);
		if (typeDef) {
			if (typeDef.targetEntity === "package" && s.packageId) {
				const pkg = ctx.packages?.get(s.packageId);
				if (pkg) {
					display.target = {
						label: pkg.name,
						href: buildPackageUrl(pkg.registry, pkg.name),
						sublabel: pkg.registry,
					};
				}
			} else if (typeDef.targetEntity === "ecosystem" && s.ecosystemId) {
				const eco = ctx.ecosystems?.get(s.ecosystemId);
				if (eco) {
					display.target = {
						label: eco.name,
						href: buildEcosystemUrl(eco.slug),
					};
				}
			}
		}

		result[s.id] = display;
	}

	return result;
}
