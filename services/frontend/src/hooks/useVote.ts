import { mutators, useZero } from "@package/database/client";
import { toast } from "@/components/ui/toast";
import { handleMutationError } from "@/lib/mutation-error";

export function useVote() {
	const zero = useZero();

	const vote = async (suggestionId: string, voteType: "approve" | "reject") => {
		const write = zero().mutate(
			mutators.suggestionVotes.vote({ suggestionId, vote: voteType }),
		);
		const res = await write.client;

		if (res.type === "error") {
			handleMutationError(res.error, "vote", { useErrorMessage: true });
			return;
		}

		toast.success(
			"Your vote has been recorded.",
			voteType === "approve" ? "Approved" : "Rejected",
		);
	};

	return { vote };
}
