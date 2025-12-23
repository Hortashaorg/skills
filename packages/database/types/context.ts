export type Context = {
	userID: string;
	roles: string[];
};

declare module "@rocicorp/zero" {
	interface DefaultTypes {
		context: Context;
	}
}
