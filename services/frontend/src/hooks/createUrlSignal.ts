import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, on, type Signal } from "solid-js";

type UrlSignalOptions<T> = {
	parse: (value: string | undefined) => T;
	serialize: (value: T) => string | undefined;
};

// String-specific defaults - only used when T = string
const stringParse = (value: string | undefined): string => value ?? "";
const stringSerialize = (value: string): string | undefined =>
	value || undefined;

// Overload: string type uses defaults
export function createUrlSignal(
	key: string,
	defaultValue: string,
): Signal<string>;

// Overload: custom types require parse/serialize
export function createUrlSignal<T>(
	key: string,
	defaultValue: T,
	options: UrlSignalOptions<T>,
): Signal<T>;

// Implementation
export function createUrlSignal<T>(
	key: string,
	defaultValue: T,
	options?: UrlSignalOptions<T>,
): Signal<T> {
	const [searchParams, setSearchParams] = useSearchParams();

	// Type-safe: if options not provided, T must be string
	const parse = options?.parse ?? (stringParse as (v: string | undefined) => T);
	const serialize =
		options?.serialize ?? (stringSerialize as (v: T) => string | undefined);

	const initialValue = searchParams[key]
		? parse(searchParams[key] as string)
		: defaultValue;

	const [value, setValue] = createSignal<T>(initialValue);

	createEffect(
		on(value, (v) => {
			const serialized = serialize(v);
			setSearchParams({ [key]: serialized }, { replace: true });
		}),
	);

	return [value, setValue] as Signal<T>;
}

export function createUrlStringSignal(
	key: string,
	defaultValue = "",
): Signal<string> {
	return createUrlSignal(key, defaultValue);
}

export function createUrlArraySignal(
	key: string,
	defaultValue: string[] = [],
): Signal<string[]> {
	return createUrlSignal(key, defaultValue, {
		parse: (v) => (v ? v.split(",").filter(Boolean) : []),
		serialize: (v) => (v.length > 0 ? v.join(",") : undefined),
	});
}
