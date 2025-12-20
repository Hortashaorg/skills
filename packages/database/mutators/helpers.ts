/** Generate a new UUID and timestamp for record creation */
export const newRecord = () => ({
	id: crypto.randomUUID(),
	now: Date.now(),
});

/** Get current timestamp for updates */
export const now = () => Date.now();
