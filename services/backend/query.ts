import {
	type AuthData,
	handleQueryRequest,
	mustGetQuery,
	queries,
	schema,
} from "@package/database/server";

export async function handleQuery(
	authData: AuthData | undefined,
	request: Request,
) {
	const ctx = { userID: authData?.sub ?? "anon" };

	return await handleQueryRequest(
		(name, args) => {
			const query = mustGetQuery(queries, name);
			return query.fn({ args, ctx });
		},
		schema,
		request,
	);
}
