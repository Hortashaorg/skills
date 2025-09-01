import {
	type AuthData,
	createMutators,
	PushProcessor,
} from "@package/database/server";
import { db } from "./util.ts";

const processor = new PushProcessor(db);

export async function handlePush(
	authData: AuthData | undefined,
	request: Request,
) {
	return await processor.process(createMutators(authData), request);
}
