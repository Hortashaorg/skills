import {
	createContext,
	createResource,
	type ParentComponent,
	Show,
	useContext,
} from "solid-js";

export type TestContextType = {
	message: string;
	data: string;
};

const TestContext = createContext<TestContextType>();

export const TestProvider: ParentComponent = (props) => {
	// Simulate async initialization (like fetching auth tokens, etc.)
	const initializeContext = async (): Promise<TestContextType> => {
		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Return the context value after async work is done
		return {
			message: "Hello from Test Context!",
			data: "Async data loaded successfully!",
		};
	};

	const [contextValue] = createResource<TestContextType>(initializeContext);

	return (
		<Show when={contextValue()} fallback={<div>Loading context...</div>}>
			<TestContext.Provider value={contextValue()}>
				{props.children}
			</TestContext.Provider>
		</Show>
	);
};

export const useTestContext = () => {
	const context = useContext(TestContext);
	if (!context) {
		throw new Error("useTestContext must be used within a TestProvider");
	}
	return context;
};
