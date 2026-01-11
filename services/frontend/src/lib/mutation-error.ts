import { toast } from "@/components/ui/toast";

type HandleMutationErrorOptions = {
	/** Custom toast message (overrides default "Failed to {action}. Please try again.") */
	message?: string;
	/** Use error.message if error is an Error instance */
	useErrorMessage?: boolean;
};

/**
 * Handles mutation errors with consistent logging and toast notifications.
 *
 * @param error - The caught error
 * @param action - What failed, e.g., "create project", "update username"
 * @param options - Optional configuration
 * @returns The error message shown to the user (useful for setting form error state)
 *
 * @example
 * // Simple usage
 * catch (err) {
 *   handleMutationError(err, "create project");
 * }
 *
 * @example
 * // With error message extraction
 * catch (err) {
 *   const message = handleMutationError(err, "export data", { useErrorMessage: true });
 *   setError(message);
 * }
 *
 * @example
 * // With custom message
 * catch (err) {
 *   handleMutationError(err, "update username", { message: "Username is already taken" });
 * }
 */
export const handleMutationError = (
	error: unknown,
	action: string,
	options?: HandleMutationErrorOptions,
): string => {
	console.error(`Failed to ${action}:`, error);

	let message: string;
	if (options?.message) {
		message = options.message;
	} else if (options?.useErrorMessage && error instanceof Error) {
		message = error.message;
	} else {
		message = `Failed to ${action}. Please try again.`;
	}

	toast.error(message);
	return message;
};
