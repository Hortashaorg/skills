import { mutators, type Registry, useZero } from "@package/database/client";
import { createSignal } from "solid-js";
import { toast } from "@/components/ui/toast";
import { handleMutationError } from "@/lib/mutation-error";

type RequestParams = {
	name: string;
	registry: Registry;
};

export function createPackageRequest(params: () => RequestParams) {
	const zero = useZero();
	const [isRequested, setIsRequested] = createSignal(false);
	const [isSubmitting, setIsSubmitting] = createSignal(false);

	const isDisabled = () => zero().userID === "anon";

	const submit = async (options?: { onSuccess?: () => void }) => {
		if (isDisabled() || isSubmitting()) return;

		setIsSubmitting(true);
		try {
			const { name, registry } = params();
			const write = zero().mutate(
				mutators.packages.requestPackage({ name, registry }),
			);

			const res = await write.client;

			if (res.type === "error") {
				handleMutationError(res.error, "submit request");
				return;
			}

			setIsRequested(true);
			options?.onSuccess?.();
			toast.success(`Request submitted for "${name}"`);
		} finally {
			setIsSubmitting(false);
		}
	};

	return {
		isRequested,
		isDisabled,
		isSubmitting,
		submit,
	};
}
