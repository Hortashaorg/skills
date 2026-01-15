import {
	type Accessor,
	createEffect,
	createSignal,
	on,
	onCleanup,
} from "solid-js";
import { getConfig } from "@/lib/config";

export interface PolledValueOptions {
	/** Polling interval in milliseconds (default: 30000) */
	interval?: number;
	/** Only poll when this returns true (default: always enabled) */
	enabled?: Accessor<boolean>;
}

/**
 * Creates a polling accessor for REST endpoints that don't have real-time sync.
 * Useful for aggregations and counts that Zero doesn't support yet.
 *
 * @param urlPath - Function returning the API path (without base URL), or null to skip fetch
 * @param options - Polling configuration
 * @returns Accessor with the fetched JSON data, or null if not yet loaded/disabled
 *
 * @example
 * const queuePosition = createPolledValue(
 *   () => `/api/queue/ahead?before=${timestamp()}`,
 *   { interval: 30_000, enabled: () => hasPendingFetch() }
 * );
 * // Use: queuePosition()?.ahead
 */
export function createPolledValue<T>(
	urlPath: Accessor<string | null>,
	options: PolledValueOptions = {},
): Accessor<T | null> {
	const { interval = 30_000, enabled = () => true } = options;

	const [value, setValue] = createSignal<T | null>(null);

	const fetchValue = async (path: string) => {
		try {
			const res = await fetch(`${getConfig().backendUrl}${path}`, {
				credentials: "include",
			});
			if (res.ok) {
				const data = await res.json();
				setValue(() => data);
			}
		} catch {
			// Ignore fetch errors - keep last value
		}
	};

	createEffect(
		on([urlPath, enabled], ([path, isEnabled]) => {
			if (!path || !isEnabled) {
				setValue(null);
				return;
			}

			// Fetch immediately
			fetchValue(path);

			// Poll at interval
			const intervalId = setInterval(() => {
				fetchValue(path);
			}, interval);

			onCleanup(() => clearInterval(intervalId));
		}),
	);

	return value;
}
