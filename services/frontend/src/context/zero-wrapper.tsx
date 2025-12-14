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
			cacheURL="http://localhost:4848"
		>
			{props.children}
		</ZeroProvider>
	);
};
