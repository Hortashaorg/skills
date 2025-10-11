import { ZeroProvider } from "@package/database/client";
import { createMemo, type ParentComponent } from "solid-js";
import { useAuth } from "./use-auth";
import { ZeroFactory } from "./zero/zero-factory";

export const ZeroWrapper: ParentComponent = (props) => {
	const auth = useAuth();
	const zeroFactory = new ZeroFactory();

	const zeroInstance = createMemo(() => {
		const authData = auth.authData();

		if (authData) {
			return zeroFactory.createAuthenticated(authData);
		}

		return zeroFactory.createAnonymous();
	});

	return <ZeroProvider zero={zeroInstance()}>{props.children}</ZeroProvider>;
};
