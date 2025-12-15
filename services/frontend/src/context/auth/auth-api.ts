import type { AuthData } from "./types";

const getBaseUrl = () => {
	const url = import.meta.env.VITE_BACKEND_BASE_URL;
	if (!url) throw new Error("VITE_BACKEND_BASE_URL not set");
	return url;
};

export const authApi = {
	async refresh(): Promise<AuthData | null> {
		try {
			const res = await fetch(`${getBaseUrl()}/refresh`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
			});

			if (!res.ok) return null;

			const result = await res.json();
			if (!result.access_token || !result.sub) return null;

			return {
				accessToken: result.access_token,
				userId: result.sub,
			};
		} catch (error) {
			console.error("Token refresh failed:", error);
			return null;
		}
	},

	async login(code: string): Promise<AuthData> {
		const res = await fetch(`${getBaseUrl()}/login`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code }),
		});

		if (!res.ok) {
			throw new Error(`Login failed: ${res.status} ${res.statusText}`);
		}

		const data = await res.json();
		if (!data.access_token || !data.sub) {
			throw new Error("Login response missing required fields");
		}

		return {
			accessToken: data.access_token,
			userId: data.sub,
		};
	},

	async logout(): Promise<void> {
		try {
			await fetch(`${getBaseUrl()}/logout`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error("Logout failed:", error);
		}
	},
};
