import {
	type AuthData,
	handleQueryRequest,
	queries,
	schema,
} from "@package/database/server";

export async function handleQuery(
	authData: AuthData | undefined,
	request: Request,
) {
	// Context (userID) is passed via the transform function
	const context = authData ? { userID: authData.sub } : undefined;

	// Transform function that looks up queries from the registry
	const transformQuery = (name: string, args: unknown) => {
		// Parse the query name (e.g., "account.myAccount" -> ["account", "myAccount"])
		const parts = name.split(".");
		if (parts.length !== 2) {
			throw new Error(`Invalid query name: ${name}`);
		}

		const [namespace, queryName] = parts;

		// Navigate the queries registry
		const namespaceQueries = queries[namespace as keyof typeof queries];
		if (!namespaceQueries) {
			throw new Error(`Unknown query namespace: ${namespace}`);
		}

		const queryFn =
			namespaceQueries[queryName as keyof typeof namespaceQueries];
		if (!queryFn || typeof queryFn !== "function") {
			throw new Error(`Unknown query: ${name}`);
		}

		// Execute the query with args and context
		// @ts-expect-error - query function types are complex
		return queryFn({ args, ctx: context });
	};

	return await handleQueryRequest(transformQuery, schema, request);
}
