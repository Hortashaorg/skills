import {
	getSuggestionToastMessages,
	isPowerUser,
	mutators,
	type ReadonlyJSONObject,
	type SuggestionType,
	useZero,
} from "@package/database/client";
import { toast } from "@/components/ui/toast";
import { getAuthData } from "@/context/app-provider";
import { handleMutationError } from "@/lib/mutation-error";

interface UseSuggestionSubmitOptions {
	type: SuggestionType;
	getEntityId?: () => { packageId?: string; ecosystemId?: string } | undefined;
	getPayload: () => ReadonlyJSONObject;
	onSuccess?: () => void;
}

export function useSuggestionSubmit(options: UseSuggestionSubmitOptions) {
	const zero = useZero();

	const submit = (justification?: string) => {
		try {
			const entityId = options.getEntityId?.();
			zero().mutate(
				mutators.suggestions.create({
					type: options.type,
					packageId: entityId?.packageId,
					ecosystemId: entityId?.ecosystemId,
					payload: options.getPayload(),
					justification,
				}),
			);

			const messages = getSuggestionToastMessages(options.type);
			const roles = getAuthData()?.roles ?? [];

			if (isPowerUser(roles)) {
				toast.success(messages.applied, "Applied");
			} else {
				toast.success(messages.pending, "Suggestion submitted");
			}

			options.onSuccess?.();
		} catch (err) {
			handleMutationError(err, "submit suggestion", { useErrorMessage: true });
		}
	};

	return { submit };
}
