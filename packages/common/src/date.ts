/**
 * Format a timestamp as a full date (e.g., "January 5, 2024")
 */
export const formatDate = (timestamp: number | null | undefined): string => {
	if (!timestamp) return "-";
	return new Date(timestamp).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

/**
 * Format a timestamp as a short date (e.g., "1/5/2024")
 */
export const formatShortDate = (
	timestamp: number | null | undefined,
): string => {
	if (!timestamp) return "-";
	return new Date(timestamp).toLocaleDateString();
};

/**
 * Format a timestamp as datetime (e.g., "1/5/2024, 2:30:00 PM")
 */
export const formatDateTime = (
	timestamp: number | null | undefined,
): string => {
	if (!timestamp) return "-";
	return new Date(timestamp).toLocaleString();
};

/**
 * Format a timestamp as compact datetime for tables (e.g., "Jan 5, 2:30 PM")
 */
export const formatCompactDateTime = (
	timestamp: number | null | undefined,
): string => {
	if (!timestamp) return "-";
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(timestamp));
};
