import { mutators, type Registry, useZero } from "@package/database/client";
import { createSignal } from "solid-js";
import { toast } from "@/components/ui/toast";

type RequestParams = {
	packageName: string;
	registry: Registry;
};

export function createPackageRequest(params: () => RequestParams) {
	const zero = useZero();
	const [isRequested, setIsRequested] = createSignal(false);

	const isDisabled = () => zero().userID === "anon";

	const submit = async (options?: { onSuccess?: () => void }) => {
		if (isDisabled()) return;

		const { packageName, registry } = params();
		const write = zero().mutate(
			mutators.packageRequests.create({ packageName, registry }),
		);

		const res = await write.client;

		if (res.type === "error") {
			console.error("Failed to request package:", res.error);
			toast.error("Failed to submit request. Please try again.");
			return;
		}

		setIsRequested(true);
		options?.onSuccess?.();
		toast.success(`Request submitted for "${packageName}"`);
	};

	return {
		isRequested,
		isDisabled,
		submit,
	};
}
