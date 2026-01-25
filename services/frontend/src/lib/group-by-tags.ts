export interface GroupByTagsResult<T> {
	groups: Record<string, T[]>;
	sortedTags: string[];
	uncategorized: T[];
}

type TagsAccessor<T> = (
	entity: T,
) => readonly { tag?: { name?: string } | null }[] | undefined;

export function groupByTags<T>(
	entities: readonly T[],
	getTags: TagsAccessor<T>,
): GroupByTagsResult<T> {
	const groups: Record<string, T[]> = {};
	const uncategorized: T[] = [];

	for (const entity of entities) {
		const tags = getTags(entity) ?? [];
		if (tags.length === 0) {
			uncategorized.push(entity);
		} else {
			let addedToGroup = false;
			for (const tagRef of tags) {
				const tagName = tagRef.tag?.name;
				if (tagName) {
					if (!groups[tagName]) {
						groups[tagName] = [];
					}
					groups[tagName].push(entity);
					addedToGroup = true;
				}
			}
			// Entity has tags but none with valid names - add to uncategorized
			if (!addedToGroup) {
				uncategorized.push(entity);
			}
		}
	}

	const sortedTags = Object.keys(groups).sort((a, b) =>
		a.toLowerCase().localeCompare(b.toLowerCase()),
	);

	return { groups, sortedTags, uncategorized };
}
