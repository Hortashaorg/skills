import { throwError } from "@package/common";

export interface AppConfig {
	frontendUrl: string;
	backendUrl: string;
	zeroUrl: string;
	zitadelIssuer: string;
	zitadelClientId: string;
}

let config: AppConfig | null = null;

export async function loadConfig(): Promise<AppConfig> {
	if (config) return config;
	const response = await fetch("/config.json");
	config = await response.json();
	return config ?? throwError("Failed to load /config.json");
}

export function getConfig(): AppConfig {
	return config ?? throwError("Config not loaded. Call loadConfig() first.");
}
