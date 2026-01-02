export * from "./date.ts";

export const throwError = (message: string): never => {
	throw new Error(message);
};

/** Get the input type of a function (first parameter) */
export type Args<T extends (...args: never[]) => unknown> = Parameters<T>[0];
