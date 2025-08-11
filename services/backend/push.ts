import { createMutators, PushProcessor } from "@package/database/server";
import { db } from "./util.ts";

const processor = new PushProcessor(db);

export async function handlePush(request: Request) {
	return await processor.process(createMutators(), request);
}
