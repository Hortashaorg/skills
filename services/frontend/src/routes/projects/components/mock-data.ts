export const mockColumns = [
	{
		id: "1",
		name: "Evaluating",
		type: "considering" as const,
		cards: [
			{
				id: "c1",
				name: "Prisma",
				description: "Next-generation ORM for Node.js and TypeScript",
				tags: ["orm", "database"],
			},
			{
				id: "c2",
				name: "tRPC",
				description: "End-to-end typesafe APIs",
				tags: ["api", "typescript"],
			},
		],
	},
	{
		id: "2",
		name: "Using",
		type: "using" as const,
		cards: [
			{
				id: "c3",
				name: "Drizzle",
				description: "TypeScript ORM that lets you write SQL",
				tags: ["orm", "database"],
			},
			{
				id: "c4",
				name: "Zod",
				description: "TypeScript-first schema validation",
				tags: ["validation"],
			},
			{
				id: "c5",
				name: "Hono",
				description: "Ultrafast web framework for the edge",
				tags: ["api", "framework"],
			},
		],
	},
	{
		id: "3",
		name: "Phasing Out",
		type: "deprecated" as const,
		cards: [
			{
				id: "c6",
				name: "Express",
				description: "Fast, unopinionated web framework",
				tags: ["api"],
			},
		],
	},
	{
		id: "4",
		name: "Rejected",
		type: "rejected" as const,
		cards: [
			{
				id: "c7",
				name: "Moment.js",
				description: "Parse, validate, manipulate dates",
				tags: ["dates"],
			},
		],
	},
];
