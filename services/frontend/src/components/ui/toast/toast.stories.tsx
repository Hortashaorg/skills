import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { ToastRegion, toast } from "./toast";

const meta = {
	title: "UI/Toast",
	tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
	render: () => {
		return (
			<div>
				<button
					type="button"
					onClick={() => toast.success("Package requested successfully!")}
					class="px-4 py-2 bg-primary text-on-primary rounded-md"
				>
					Show Success Toast
				</button>
				<ToastRegion />
			</div>
		);
	},
};

export const ErrorToast: Story = {
	render: () => {
		return (
			<div>
				<button
					type="button"
					onClick={() =>
						toast.error("Failed to request package. Please try again.")
					}
					class="px-4 py-2 bg-danger text-on-danger rounded-md"
				>
					Show Error Toast
				</button>
				<ToastRegion />
			</div>
		);
	},
};

export const Info: Story = {
	render: () => {
		return (
			<div>
				<button
					type="button"
					onClick={() => toast.info("Processing your request...")}
					class="px-4 py-2 bg-info text-on-info rounded-md"
				>
					Show Info Toast
				</button>
				<ToastRegion />
			</div>
		);
	},
};

export const Warning: Story = {
	render: () => {
		return (
			<div>
				<button
					type="button"
					onClick={() =>
						toast.warning("You have reached 8 out of 10 requests this hour")
					}
					class="px-4 py-2 bg-warning text-on-warning rounded-md"
				>
					Show Warning Toast
				</button>
				<ToastRegion />
			</div>
		);
	},
};

export const CustomTitle: Story = {
	render: () => {
		return (
			<div>
				<button
					type="button"
					onClick={() =>
						toast.success("Package 'express' has been added", "Custom Title")
					}
					class="px-4 py-2 bg-primary text-on-primary rounded-md"
				>
					Show Toast with Custom Title
				</button>
				<ToastRegion />
			</div>
		);
	},
};

export const CustomDuration: Story = {
	render: () => {
		return (
			<div>
				<button
					type="button"
					onClick={() =>
						toast.custom({
							variant: "info",
							title: "Long Message",
							description: "This toast will stay for 10 seconds",
							duration: 10000,
						})
					}
					class="px-4 py-2 bg-info text-on-info rounded-md"
				>
					Show Toast (10 seconds)
				</button>
				<ToastRegion />
			</div>
		);
	},
};

export const MultipleToasts: Story = {
	render: () => {
		const showMultiple = () => {
			toast.info("First toast");
			setTimeout(() => toast.success("Second toast"), 500);
			setTimeout(() => toast.warning("Third toast"), 1000);
		};

		return (
			<div>
				<button
					type="button"
					onClick={showMultiple}
					class="px-4 py-2 bg-primary text-on-primary rounded-md"
				>
					Show Multiple Toasts
				</button>
				<ToastRegion />
			</div>
		);
	},
};

export const AllVariants: Story = {
	render: () => {
		const showAll = () => {
			toast.success("Success message");
			toast.error("Error message");
			toast.info("Info message");
			toast.warning("Warning message");
		};

		return (
			<div class="space-y-4">
				<button
					type="button"
					onClick={showAll}
					class="px-4 py-2 bg-primary text-on-primary rounded-md"
				>
					Show All Variants
				</button>
				<div class="text-sm text-on-surface-muted">
					Click to see all toast variants at once
				</div>
				<ToastRegion />
			</div>
		);
	},
};
