import type { ParentComponent } from "solid-js";

export const Layout: ParentComponent = ({ children }) => {
	return (
		<div>
			Layout
			{children}
		</div>
	);
};
