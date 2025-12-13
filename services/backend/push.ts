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
	// Context (userID) is now passed to the PushProcessor constructor
	const context = authData ? { userID: authData.sub } : undefined;
	const processor = new PushProcessor(db, context);
	return await processor.process(mutators, request);
}
