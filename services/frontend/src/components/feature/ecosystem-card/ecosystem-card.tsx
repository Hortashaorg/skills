import {
	ResourceCard,
	type ResourceTag,
} from "@/components/composite/resource-card";
import { Text } from "@/components/primitives/text";

export type { ResourceTag as EcosystemTag };

export interface EcosystemCardProps {
	name: string;
	description?: string | null;
	href: string;
	upvoteCount: number;
	isUpvoted: boolean;
	upvoteDisabled: boolean;
	onUpvote: () => void;
	tags?: readonly ResourceTag[];
	packageCount?: number;
	isPending?: boolean;
	onRemove?: () => void;
}

export const EcosystemCard = (props: EcosystemCardProps) => {
	const footer = () => {
		if (props.isPending) return null;
		if (props.packageCount !== undefined) {
			return (
				<Text size="xs" color="muted">
					{props.packageCount} packages
				</Text>
			);
		}
		return null;
	};

	return (
		<ResourceCard
			name={props.name}
			href={props.href}
			description={props.description}
			tags={props.tags}
			upvoteCount={props.upvoteCount}
			isUpvoted={props.isUpvoted}
			upvoteDisabled={props.upvoteDisabled}
			onUpvote={props.onUpvote}
			onRemove={props.onRemove}
			status={props.isPending ? "pending" : "default"}
			footer={footer()}
		/>
	);
};
