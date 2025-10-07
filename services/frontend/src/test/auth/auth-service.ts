import type { AuthData } from "../types";

export class AuthService {
	private baseUrl: string;

	constructor() {
		this.baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
	}

	/**
	 * Attempts to refresh the access token using the refresh token cookie
	 * Returns AuthData if successful, null if no valid session
	 */
	async refresh(): Promise<AuthData | null> {
		try {
			const res = await fetch(`${this.baseUrl}/refresh`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (res.ok) {
				const result = await res.json();
				return {
					accessToken: result.access_token,
					userId: result.sub,
				};
			}

			return null;
		} catch (error) {
			console.error("Token refresh failed:", error);
			return null;
		}
	}

	/**
	 * Placeholder for login - will implement in Step 3
	 */
	async login(code: string): Promise<AuthData> {
		throw new Error("Login not implemented yet");
	}

	/**
	 * Placeholder for logout - will implement in Step 6
	 */
	async logout(): Promise<void> {
		throw new Error("Logout not implemented yet");
	}
}
