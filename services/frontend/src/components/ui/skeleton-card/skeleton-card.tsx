import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonCard = () => (
	<Card padding="md" class="h-full">
		<div class="flex flex-col h-full gap-2">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Skeleton width="120px" height="20px" />
					<Skeleton width="40px" height="20px" />
				</div>
				<Skeleton width="50px" height="28px" variant="rectangular" />
			</div>
			<Skeleton width="100%" height="16px" />
			<Skeleton width="75%" height="16px" />
		</div>
	</Card>
);
