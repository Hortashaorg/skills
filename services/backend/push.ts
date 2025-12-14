import {
	type AuthData,
	mutators,
	PushProcessor,
} from "@package/database/server";
import { db } from "./util.ts";

export async function handlePush(
	authData: AuthData | undefined,
	request: Request,
) {
	// Context (userID) is passed to the PushProcessor constructor
	// For mutations, context is undefined when not authenticated
	const context = authData?.sub ? { userID: authData.sub } : undefined;
	const processor = new PushProcessor(db, context);
	return await processor.process(mutators, request);
}
