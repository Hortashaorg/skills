import { useZero } from "@/utils/zero-context-provider";

export const Callback = () => {
	const zero = useZero();

	zero.login();

	return <div>Logging in...</div>;
};
