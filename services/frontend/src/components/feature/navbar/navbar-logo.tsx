import { A } from "@solidjs/router";

export type NavbarLogoProps = {
	onNavigate?: () => void;
};

export const NavbarLogo = (props: NavbarLogoProps) => {
	return (
		<A href="/" class="hover:opacity-75 transition" onClick={props.onNavigate}>
			<span class="text-lg font-semibold text-on-surface dark:text-on-surface-dark inline-flex items-center gap-1.5">
				<svg class="w-5 h-5" viewBox="0 0 32 32" fill="none">
					<title>TechGarden</title>
					<path
						d="M16 28 C16 28 16 18 16 14"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						class="text-brand dark:text-brand-dark"
					/>
					<path
						d="M16 18 C12 16 8 12 10 6 C14 8 16 12 16 18"
						fill="currentColor"
						class="text-brand dark:text-brand-dark"
					/>
					<path
						d="M16 14 C20 12 24 10 26 4 C22 6 18 10 16 14"
						fill="currentColor"
						class="text-success dark:text-success-dark"
					/>
				</svg>
				Tech<span class="text-brand dark:text-brand-dark">Garden</span>
			</span>
		</A>
	);
};
