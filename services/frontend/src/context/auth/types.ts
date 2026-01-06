export type AuthData = {
	accessToken: string;
	userId: string;
	roles: string[];
	expiresAt: number;
};

export class EmailUnverifiedError extends Error {
	constructor() {
		super("Email not verified");
		this.name = "EmailUnverifiedError";
	}
}
