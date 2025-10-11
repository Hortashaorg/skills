import {
	createMutators,
	decodeAuthData,
	schema,
	ZeroProvider,
} from "@package/database/client";
import { createMemo, type ParentComponent } from "solid-js";
import { ZeroFactory } from "@/lib/zero/zero-factory";
import { useAuth } from "./use-auth";

/**
 * Wraps Rocicorp's ZeroProvider with reactive auth state
 * When auth changes, Zero automatically reconnects with new credentials
 */
export const ZeroWrapper: ParentComponent = (props) => {
	const auth = useAuth();
	const zeroFactory = new ZeroFactory();

	// Create a reactive Zero instance that updates when auth changes
	const zeroInstance = createMemo(() => {
		const authData = auth.authData();

		if (authData) {
			// Authenticated user
			return zeroFactory.createAuthenticated(authData);
		}

		// Anonymous user
		return zeroFactory.createAnonymous();
	});

	return <ZeroProvider zero={zeroInstance()}>{props.children}</ZeroProvider>;
};
