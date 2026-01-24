import { mutators, useZero } from "@package/database/client";
import { toast } from "@/components/ui/toast";
import { handleMutationError } from "@/lib/mutation-error";

export function useVote() {
	const zero = useZero();

	const vote = (suggestionId: string, voteType: "approve" | "reject") => {
		try {
			zero().mutate(
				mutators.suggestionVotes.vote({ suggestionId, vote: voteType }),
			);
			toast.success(
				"Your vote has been recorded.",
				voteType === "approve" ? "Approved" : "Rejected",
			);
		} catch (err) {
			handleMutationError(err, "vote", { useErrorMessage: true });
		}
	};

	return { vote };
}
