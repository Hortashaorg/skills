import { useZeroRocicorp } from "@package/database/client";

/**
 * Returns the current Zero instance from context.
 * In Zero 0.25, useZero returns a signal, so we unwrap it with ()()
 */
export const useZeroInstance = () => {
	return useZeroRocicorp()();
};
