import { useContext } from "solid-js";
import { ZeroContext } from "./zero-provider";

export const useZero = () => {
	const context = useContext(ZeroContext);
	if (!context) {
		throw new Error("useZero must be used within a ZeroProvider");
	}
	return context;
};
