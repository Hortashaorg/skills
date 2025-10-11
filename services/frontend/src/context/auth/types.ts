export type AuthState = "loading" | "authenticated" | "unauthenticated";

export type AuthData = {
	accessToken: string;
	userId: string;
};
