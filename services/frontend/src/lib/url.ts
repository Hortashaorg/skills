export function buildPackageUrl(
	registry: string,
	name: string,
	version?: string,
): string {
	const base = `/package/${encodeURIComponent(registry)}/${encodeURIComponent(name)}`;
	return version ? `${base}?v=${encodeURIComponent(version)}` : base;
}
