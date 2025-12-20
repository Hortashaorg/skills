export const throwError = (message: string) => {
	throw new Error(message);
};

/** Get the input type of a function (first parameter) */
export type Args<T extends (...args: never[]) => unknown> = Parameters<T>[0];
