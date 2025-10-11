import type { AuthData } from "./types";

export class AuthService {
	private baseUrl: string;

	constructor() {
		this.baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
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

	async login(code: string): Promise<AuthData> {
		const res = await fetch(`${this.baseUrl}/login`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ code }),
		});

		if (!res.ok) {
			throw new Error("Login failed");
		}

		const data = await res.json();
		return {
			accessToken: data.access_token,
			userId: data.sub,
		};
	}

	async logout(): Promise<void> {
		throw new Error("Logout not implemented yet");
	}
}
