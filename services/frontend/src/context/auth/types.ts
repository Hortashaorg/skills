export type AuthData = {
	accessToken: string;
	userId: string;
	roles: string[];
};

export class EmailUnverifiedError extends Error {
	constructor() {
		super("Email not verified");
		this.name = "EmailUnverifiedError";
	}
}
