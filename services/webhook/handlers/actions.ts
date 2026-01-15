import { createLogger } from "@package/instrumentation/utils";
import type { Context } from "hono";
import type { ActionsV2Payload } from "../types.ts";

const logger = createLogger("webhook:actions");

export function handleRetrieveIdentityProviderIntent(
	payload: ActionsV2Payload,
	c: Context,
) {
	const idpInfo = payload.response?.idpInformation;

	logger.info("Processing IDP intent", {
		idpId: idpInfo?.idpId,
		userId: idpInfo?.userId,
	});

	// Pass through without modification - name/profile updates via webhook don't work
	return c.json({});
}
