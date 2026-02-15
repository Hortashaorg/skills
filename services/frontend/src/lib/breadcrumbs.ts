type Params = Record<string, string | undefined>;

/**
 * Resolver specification for dynamic breadcrumb labels.
 * The resolver function is provided by Layout and has access to Zero queries.
 *
 * @example
 * // In config - specify what to resolve
 * { resolve: { type: "tag", param: "tagId" } }
 *
 * // In Layout - provide resolver implementations
 * const resolvers = {
 *   tag: (id) => {
 *     const [tag] = useQuery(() => queries.tags.byId({ id }));
 *     return () => tag()?.name ?? id;
 *   }
 * };
 */
export type ResolverSpec = {
	type: string;
	param: string;
};

type BreadcrumbSegment = {
	label: string | ((params: Params) => string);
	href?: string | ((params: Params) => string);
	resolve?: ResolverSpec;
};

type BreadcrumbConfig = {
	pattern: RegExp;
	segments: BreadcrumbSegment[];
};

const configs: BreadcrumbConfig[] = [
	{
		pattern: /^\/package\/([^/]+)\/([^/]+)(\/.*)?$/,
		segments: [
			{ label: "Home", href: "/" },
			{ label: "Packages", href: "/packages" },
			{ label: (p) => decodeURIComponent(p.name ?? "") },
		],
	},
	{
		pattern: /^\/admin\/requests$/,
		segments: [
			{ label: "Home", href: "/" },
			{ label: "Admin" },
			{ label: "Package Requests" },
		],
	},
	{
		pattern: /^\/admin\/tags$/,
		segments: [
			{ label: "Home", href: "/" },
			{ label: "Admin" },
			{ label: "Tags" },
		],
	},
	{
		pattern: /^\/projects\/([^/]+)(\/.*)?$/,
		segments: [
			{ label: "Home", href: "/" },
			{ label: "Projects", href: "/projects" },
			{
				label: (p) => p.id ?? "",
				resolve: { type: "project", param: "id" },
			},
		],
	},
	{
		pattern: /^\/me\/notifications$/,
		segments: [
			{ label: "Home", href: "/" },
			{ label: "Profile", href: "/me" },
			{ label: "Notifications" },
		],
	},
	{
		pattern: /^\/me\/projects$/,
		segments: [
			{ label: "Home", href: "/" },
			{ label: "Profile", href: "/me" },
			{ label: "My Projects" },
		],
	},
	{
		pattern: /^\/me\/projects\/new$/,
		segments: [
			{ label: "Home", href: "/" },
			{ label: "Profile", href: "/me" },
			{ label: "My Projects", href: "/me/projects" },
			{ label: "New" },
		],
	},
	{
		pattern: /^\/curation$/,
		segments: [{ label: "Home", href: "/" }, { label: "Community Curation" }],
	},
];

export type BreadcrumbSegmentResult = {
	label: string;
	href?: string;
	current: boolean;
	resolve?: ResolverSpec;
};

export function getBreadcrumbs(
	pathname: string,
	params: Params,
): BreadcrumbSegmentResult[] | null {
	for (const config of configs) {
		if (config.pattern.test(pathname)) {
			return config.segments.map((segment, index) => ({
				label:
					typeof segment.label === "function"
						? segment.label(params)
						: segment.label,
				href:
					typeof segment.href === "function"
						? segment.href(params)
						: segment.href,
				current: index === config.segments.length - 1,
				resolve: segment.resolve,
			}));
		}
	}
	return null;
}
