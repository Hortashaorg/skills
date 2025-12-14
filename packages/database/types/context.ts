export type Context = {
	userID: string;
};

declare module "@rocicorp/zero" {
	interface DefaultTypes {
		context: Context;
	}
}
