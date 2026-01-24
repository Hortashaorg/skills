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
	entityId?: { packageId?: string; ecosystemId?: string };
	getPayload: () => ReadonlyJSONObject;
	onSuccess?: () => void;
}

export function useSuggestionSubmit(options: UseSuggestionSubmitOptions) {
	const zero = useZero();

	const submit = (justification?: string) => {
		try {
			zero().mutate(
				mutators.suggestions.create({
					type: options.type,
					packageId: options.entityId?.packageId,
					ecosystemId: options.entityId?.ecosystemId,
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
