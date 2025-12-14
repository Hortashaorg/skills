import { mutators, schema, ZeroProvider } from "@package/database/client";
import type { ParentComponent } from "solid-js";
import { useAuth } from "./use-auth";

export const ZeroWrapper: ParentComponent = (props) => {
	const auth = useAuth();

	return (
		<ZeroProvider
			userID={auth.authData()?.userId ?? "anon"}
			auth={auth.authData()?.accessToken ?? null}
			context={{ userID: auth.authData()?.userId ?? "anon" }}
			schema={schema}
			mutators={mutators}
			cacheURL={import.meta.env.VITE_CACHE_BASE_URL}
		>
			{props.children}
		</ZeroProvider>
	);
};
