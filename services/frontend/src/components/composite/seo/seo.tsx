import { Meta, Title } from "@solidjs/meta";
import { Show } from "solid-js";

export type SEOProps = {
	title?: string;
	description?: string;
	ogImage?: string;
};

const DEFAULT_DESCRIPTION =
	"Explore and discover packages across registries. Search npm, request packages, and track dependencies.";

export const SEO = (props: SEOProps) => {
	const fullTitle = () =>
		props.title ? `${props.title} - TechGarden` : "TechGarden";
	const description = () => props.description || DEFAULT_DESCRIPTION;

	return (
		<>
			<Title>{fullTitle()}</Title>
			<Meta name="description" content={description()} />

			{/* Open Graph */}
			<Meta property="og:title" content={fullTitle()} />
			<Meta property="og:description" content={description()} />
			<Meta property="og:type" content="website" />
			<Show when={props.ogImage}>
				<Meta property="og:image" content={props.ogImage} />
			</Show>

			{/* Twitter Card */}
			<Meta name="twitter:card" content="summary" />
			<Meta name="twitter:title" content={fullTitle()} />
			<Meta name="twitter:description" content={description()} />
		</>
	);
};
