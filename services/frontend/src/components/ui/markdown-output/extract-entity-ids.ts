/**
 * Extract entity IDs from markdown content.
 * Looks for tokens in format: $$type:id
 */

export type ExtractedEntityIds = {
	packages: string[];
	ecosystems: string[];
	projects: string[];
	users: string[];
};

/** Regex pattern for entity tokens: $$type:id */
export const ENTITY_TOKEN_REGEX =
	/\$\$(user|project|package|ecosystem):([a-zA-Z0-9_-]+)/g;

export function extractEntityIds(content: string): ExtractedEntityIds {
	const result: ExtractedEntityIds = {
		packages: [],
		ecosystems: [],
		projects: [],
		users: [],
	};

	const seen = {
		packages: new Set<string>(),
		ecosystems: new Set<string>(),
		projects: new Set<string>(),
		users: new Set<string>(),
	};

	for (const match of content.matchAll(ENTITY_TOKEN_REGEX)) {
		const type = match[1] as "user" | "project" | "package" | "ecosystem";
		const id = match[2];
		if (!id) continue;

		const key =
			type === "package"
				? "packages"
				: type === "ecosystem"
					? "ecosystems"
					: type === "project"
						? "projects"
						: "users";

		if (!seen[key].has(id)) {
			seen[key].add(id);
			result[key].push(id);
		}
	}

	return result;
}

/**
 * Extract entity IDs from multiple markdown strings.
 */
export function extractEntityIdsFromMultiple(
	contents: string[],
): ExtractedEntityIds {
	const result: ExtractedEntityIds = {
		packages: [],
		ecosystems: [],
		projects: [],
		users: [],
	};

	const seen = {
		packages: new Set<string>(),
		ecosystems: new Set<string>(),
		projects: new Set<string>(),
		users: new Set<string>(),
	};

	for (const content of contents) {
		for (const match of content.matchAll(ENTITY_TOKEN_REGEX)) {
			const type = match[1] as "user" | "project" | "package" | "ecosystem";
			const id = match[2];
			if (!id) continue;

			const key =
				type === "package"
					? "packages"
					: type === "ecosystem"
						? "ecosystems"
						: type === "project"
							? "projects"
							: "users";

			if (!seen[key].has(id)) {
				seen[key].add(id);
				result[key].push(id);
			}
		}
	}

	return result;
}
