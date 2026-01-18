import {
	ResourceCard,
	type ResourceTag,
} from "@/components/composite/resource-card";
import { Badge } from "@/components/ui/badge";

export type { ResourceTag as PackageTag };

export interface PackageCardProps {
	name: string;
	registry: string;
	description?: string | null;
	href: string;
	upvoteCount: number;
	isUpvoted: boolean;
	upvoteDisabled: boolean;
	onUpvote: () => void;
	tags?: readonly ResourceTag[];
	status?: "failed" | "placeholder";
	failureReason?: string | null;
	versionRange?: string;
	onRemove?: () => void;
}

export const PackageCard = (props: PackageCardProps) => {
	const resourceStatus = () => {
		if (props.status === "placeholder") return "pending" as const;
		if (props.status === "failed") return "failed" as const;
		return "default" as const;
	};

	const footer = () => {
		if (props.status === "placeholder") {
			return (
				<Badge variant="warning" size="sm">
					not fetched
				</Badge>
			);
		}
		if (props.versionRange) {
			return (
				<Badge variant="secondary" size="sm">
					{props.versionRange}
				</Badge>
			);
		}
		return null;
	};

	return (
		<ResourceCard
			name={props.name}
			href={props.href}
			description={props.description}
			badge={props.registry}
			tags={props.tags}
			upvoteCount={props.upvoteCount}
			isUpvoted={props.isUpvoted}
			upvoteDisabled={props.upvoteDisabled}
			onUpvote={props.onUpvote}
			status={resourceStatus()}
			failureReason={props.failureReason}
			onRemove={props.onRemove}
			footer={footer()}
		/>
	);
};
