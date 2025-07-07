import { type Unauthenticated, useZero } from "@/utils/zero-context-provider";

export const Callback = () => {
	const zero = useZero<Unauthenticated>();

	zero.login();

	return <div>YOLO</div>;
};
