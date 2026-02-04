export { z } from "zod";
export * from "./date.ts";

export const throwError = (message: string): never => {
	throw new Error(message);
};

// Content limits
export const MAX_COMMENT_LENGTH = 10000;

/** Get the input type of a function (first parameter) */
export type Args<T extends (...args: never[]) => unknown> = Parameters<T>[0];
