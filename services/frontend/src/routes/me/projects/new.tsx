import { mutators, useZero } from "@package/database/client";
import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { AuthGuard } from "@/components/composite/auth-guard";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { Layout } from "@/layout/Layout";
import { ProjectForm } from "./sections/ProjectForm";

export const NewProject = () => {
	const zero = useZero();
	const navigate = useNavigate();
	const isLoggedIn = () => zero().userID !== "anon";

	const [isSubmitting, setIsSubmitting] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);

	const handleSubmit = async (data: { name: string; description?: string }) => {
		setIsSubmitting(true);
		setError(null);

		try {
			const result = await zero().mutate(
				mutators.projects.create({
					name: data.name,
					description: data.description,
				}),
			).client;

			if (result.type === "error") {
				throw result.error;
			}

			navigate("/me/projects");
		} catch (err) {
			console.error("Failed to create project:", err);
			const message = "Failed to create project. Please try again.";
			setError(message);
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		navigate("/me/projects");
	};

	return (
		<Layout>
			<Container size="sm">
				<Stack spacing="lg" class="py-8">
					<AuthGuard
						hasAccess={isLoggedIn()}
						fallback={
							<Card padding="lg">
								<Stack spacing="md" align="center">
									<Heading level="h2">Sign in to create a project</Heading>
									<Text color="muted">
										You need to be logged in to create projects.
									</Text>
								</Stack>
							</Card>
						}
					>
						<Heading level="h1">New Project</Heading>

						<Card padding="lg">
							<ProjectForm
								onSubmit={handleSubmit}
								onCancel={handleCancel}
								isSubmitting={isSubmitting()}
								error={error()}
							/>
						</Card>
					</AuthGuard>
				</Stack>
			</Container>
		</Layout>
	);
};
