import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, on, type Signal } from "solid-js";

type UrlSignalOptions<T> = {
	parse?: (value: string | undefined) => T;
	serialize?: (value: T) => string | undefined;
};

const defaultParse = <T>(value: string | undefined): T =>
	(value ?? "") as unknown as T;
const defaultSerialize = <T>(value: T): string | undefined =>
	value ? String(value) : undefined;

export function createUrlSignal<T = string>(
	key: string,
	defaultValue: T,
	options?: UrlSignalOptions<T>,
): Signal<T> {
	const [searchParams, setSearchParams] = useSearchParams();
	const parse = options?.parse ?? defaultParse<T>;
	const serialize = options?.serialize ?? defaultSerialize<T>;

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
