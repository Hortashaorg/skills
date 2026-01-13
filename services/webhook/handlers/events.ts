import { db, softDeleteAccountByZitadelId } from "@package/database/server";
import { createLogger } from "@package/instrumentation/utils";
import type { ZitadelEvent } from "../types.ts";
import { addOrgMembership, verifyUserEmail } from "../zitadel-api.ts";

const logger = createLogger("webhook:events");

export async function handleExternalIdpAdded(
	event: ZitadelEvent,
): Promise<void> {
	const zitadelId = event.aggregateID;
	const orgId = event.resourceOwner;

	logger.info("Processing user.human.externalidp.added event", { zitadelId });

	// Verify email (GitHub requires verified email for OAuth, so we trust it)
	const emailVerified = await verifyUserEmail(zitadelId);
	if (!emailVerified) {
		logger.warn("Failed to verify email", { zitadelId });
	}

	// Add org membership for self-management (so users can delete their account)
	const membershipAdded = await addOrgMembership(zitadelId, orgId);
	if (!membershipAdded) {
		logger.warn("Failed to assign self-management role", { zitadelId });
	}

	logger.info("Completed post-registration setup", {
		zitadelId,
		emailVerified,
		membershipAdded,
	});
}

export async function handleUserRemoved(event: ZitadelEvent): Promise<void> {
	const zitadelId = event.aggregateID;

	logger.info("Processing user.removed event", { zitadelId });

	const result = await softDeleteAccountByZitadelId(db, zitadelId);

	if (result.notFound) {
		logger.warn("No account found for zitadelId", { zitadelId });
	} else if (result.success) {
		logger.info("Account soft-deleted", {
			zitadelId,
			accountId: result.accountId,
		});
	}
}
