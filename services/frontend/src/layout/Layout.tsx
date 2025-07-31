import type { ParentComponent } from "solid-js";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuIcon,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export const Layout: ParentComponent = ({ children }) => {
	return (
		<div>
			<NavigationMenu>
				<NavigationMenuItem>
					<NavigationMenuTrigger>
						Item one
						<NavigationMenuIcon />
					</NavigationMenuTrigger>
					<NavigationMenuContent>
						<NavigationMenuLink>Link</NavigationMenuLink>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenu>
			{children}
		</div>
	);
};
