import { z } from "@package/common";

/**
 * Zod schemas for Docker Hub API responses.
 * API docs: https://docs.docker.com/docker-hub/api/latest/
 */

export const DockerHubRepositorySchema = z.object({
	user: z.string(),
	name: z.string(),
	namespace: z.string(),
	description: z.string().nullable(),
	pull_count: z.number(),
	star_count: z.number(),
	last_updated: z.string().nullable(),
});

export const DockerHubTagSchema = z.object({
	name: z.string(),
	last_updated: z.string().nullable(),
	digest: z.string().nullish(), // Can be null, undefined, or missing entirely
});

export const DockerHubTagsResponseSchema = z.object({
	count: z.number(),
	next: z.string().nullable(),
	previous: z.string().nullable(),
	results: z.array(DockerHubTagSchema),
});

export type DockerHubRepository = z.infer<typeof DockerHubRepositorySchema>;
export type DockerHubTag = z.infer<typeof DockerHubTagSchema>;
export type DockerHubTagsResponse = z.infer<typeof DockerHubTagsResponseSchema>;

export const schemas = {
	repository: DockerHubRepositorySchema,
	tag: DockerHubTagSchema,
	tagsResponse: DockerHubTagsResponseSchema,
};
