/**
 * Power user helpers for auto-approving suggestions.
 *
 * Power users (admin, curator) have their suggestions automatically approved
 * and applied on creation, skipping the voting workflow.
 */

const POWER_USER_ROLES = ["admin", "curator"] as const;

export type PowerUserRole = (typeof POWER_USER_ROLES)[number];

/**
 * Check if the user has a power user role that enables auto-approve.
 * Roles come from Zitadel JWT claims.
 */
export function isPowerUser(roles: readonly string[] | undefined): boolean {
	if (!roles || roles.length === 0) return false;
	return roles.some((role) => POWER_USER_ROLES.includes(role as PowerUserRole));
}
