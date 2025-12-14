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
	// Context (userID) is injected into query execution
	const context = authData ? { userID: authData.sub } : { userID: "anon" };

	// Transform function that looks up query definitions and executes them with context
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

		const queryDefinition =
			namespaceQueries[queryName as keyof typeof namespaceQueries];
		if (!queryDefinition) {
			throw new Error(`Unknown query: ${name}`);
		}

		// Call the query definition's function with args and context
		// @ts-expect-error - query definition types are complex
		const queryFn = queryDefinition.fn;
		if (typeof queryFn !== "function") {
			throw new Error(`Query ${name} does not have a function`);
		}

		// Execute query function with context
		return queryFn({ args, ctx: context });
	};

	return await handleQueryRequest(transformQuery, schema, request);
}
