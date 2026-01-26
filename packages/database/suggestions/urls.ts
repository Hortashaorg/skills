/**
 * URL builders for suggestion type display.
 * Lives in the database package so suggestion types can build links
 * without depending on the frontend.
 */

export function buildPackageUrl(registry: string, name: string): string {
	return `/package/${encodeURIComponent(registry)}/${encodeURIComponent(name)}`;
}

export function buildEcosystemUrl(slug: string): string {
	return `/ecosystem/${encodeURIComponent(slug)}`;
}
