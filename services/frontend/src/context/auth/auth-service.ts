import type { AuthData } from "./types";

export class AuthService {
	private baseUrl: string;

	constructor() {
		const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
		if (!baseUrl) {
			throw new Error(
				"VITE_BACKEND_BASE_URL environment variable is not defined. Please check your .env file.",
			);
		}
		this.baseUrl = baseUrl;
	}

	async refresh(): Promise<AuthData | null> {
		try {
			const res = await fetch(`${this.baseUrl}/refresh`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!res.ok) {
				console.warn(
					`Token refresh failed with status ${res.status}: ${res.statusText}`,
				);
				return null;
			}

			const result = await res.json();

			if (!result.access_token || !result.sub) {
				console.error(
					"Token refresh response missing required fields:",
					result,
				);
				return null;
			}

			return {
				accessToken: result.access_token,
				userId: result.sub,
			};
		} catch (error) {
			console.error("Token refresh failed with error:", error);
			return null;
		}
	}

	async login(code: string): Promise<AuthData> {
		try {
			const res = await fetch(`${this.baseUrl}/login`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ code }),
			});

			if (!res.ok) {
				const errorText = await res.text();
				console.error(
					`Login failed with status ${res.status}: ${res.statusText}`,
					errorText,
				);
				throw new Error(
					`Login failed with status ${res.status}: ${res.statusText}`,
				);
			}

			const data = await res.json();

			if (!data.access_token || !data.sub) {
				console.error("Login response missing required fields:", data);
				throw new Error("Login response missing required fields");
			}

			return {
				accessToken: data.access_token,
				userId: data.sub,
			};
		} catch (error) {
			if (error instanceof Error) {
				console.error("Login failed:", error.message);
			} else {
				console.error("Login failed with unknown error:", error);
			}
			throw error;
		}
	}

	async logout(): Promise<void> {
		try {
			const res = await fetch(`${this.baseUrl}/logout`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!res.ok) {
				console.warn(
					`Logout failed with status ${res.status}: ${res.statusText}`,
				);
			}
		} catch (error) {
			console.error("Logout failed with error:", error);
			// Don't throw - we want to clear client state even if server call fails
		}
	}
}
