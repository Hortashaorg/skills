import { useZeroRocicorp } from "@package/database/client";

export const useZeroInstance = () => {
	return useZeroRocicorp()();
};
