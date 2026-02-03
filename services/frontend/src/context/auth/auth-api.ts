import { z } from "@package/common";
import { getConfig } from "@/lib/config";
import type { AuthData } from "./types";

const authResponseSchema = z.object({
	access_token: z.string(),
	expires_in: z.number(),
	sub: z.string(),
	roles: z.array(z.string()).optional().default([]),
});

export const authApi = {
	async refresh(): Promise<AuthData | null> {
		console.log("[Auth] refresh() called");
		try {
			const res = await fetch(`${getConfig().backendUrl}/refresh`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
			});

			if (!res.ok) {
				console.log("[Auth] refresh failed - response not ok:", res.status);
				return null;
			}

			const result = authResponseSchema.safeParse(await res.json());
			if (!result.success) {
				console.log("[Auth] refresh failed - invalid response schema");
				return null;
			}

			const authData = {
				accessToken: result.data.access_token,
				userId: result.data.sub,
				roles: result.data.roles,
				expiresAt: Date.now() + result.data.expires_in * 1000,
			};
			console.log(
				"[Auth] refresh success - expires in",
				result.data.expires_in,
				"seconds",
			);
			return authData;
		} catch (error) {
			console.error("[Auth] refresh failed with error:", error);
			return null;
		}
	},

	async login(code: string): Promise<AuthData> {
		const res = await fetch(`${getConfig().backendUrl}/login`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code }),
		});

		const data = await res.json();

		if (!res.ok) {
			throw new Error(`Login failed: ${res.status} ${res.statusText}`);
		}

		const result = authResponseSchema.safeParse(data);
		if (!result.success) {
			throw new Error("Login response missing required fields");
		}

		return {
			accessToken: result.data.access_token,
			userId: result.data.sub,
			roles: result.data.roles,
			expiresAt: Date.now() + result.data.expires_in * 1000,
		};
	},

	async logout(): Promise<void> {
		try {
			await fetch(`${getConfig().backendUrl}/logout`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error("Logout failed:", error);
		}
	},
};
