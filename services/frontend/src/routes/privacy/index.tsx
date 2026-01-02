import { A } from "@solidjs/router";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { Layout } from "@/layout/Layout";

export const Privacy = () => {
	return (
		<Layout>
			<Container size="md">
				<Stack spacing="lg" class="py-8">
					<Heading level="h1">Privacy Policy</Heading>

					<Card padding="lg">
						<Stack spacing="lg">
							<section>
								<Heading level="h2" class="mb-2">
									What We Collect
								</Heading>
								<Stack spacing="sm">
									<Text>When you create an account, we collect:</Text>
									<ul class="list-disc list-inside space-y-1 text-on-surface dark:text-on-surface-dark">
										<li>Email address (for authentication)</li>
										<li>Username (displayed on your projects)</li>
										<li>Account creation date</li>
									</ul>
									<Text>
										We also store your activity on the platform: projects you
										create, packages you upvote, and tags you add.
									</Text>
								</Stack>
							</section>

							<section>
								<Heading level="h2" class="mb-2">
									How We Use Your Data
								</Heading>
								<Stack spacing="sm">
									<Text>Your data is used to:</Text>
									<ul class="list-disc list-inside space-y-1 text-on-surface dark:text-on-surface-dark">
										<li>Authenticate you and maintain your session</li>
										<li>Display your username on projects you create</li>
										<li>Track your upvotes and preferences</li>
									</ul>
									<Text>
										We do not sell your data or share it with third parties for
										marketing purposes.
									</Text>
								</Stack>
							</section>

							<section>
								<Heading level="h2" class="mb-2">
									Your Rights
								</Heading>
								<Stack spacing="sm">
									<Text>You can manage your data from your profile:</Text>
									<ul class="list-disc list-inside space-y-1 text-on-surface dark:text-on-surface-dark">
										<li>View your account information</li>
										<li>Update your username</li>
										<li>Delete your account entirely</li>
									</ul>
									<Text>
										Visit your{" "}
										<A
											href="/me"
											class="text-primary dark:text-primary-dark hover:underline"
										>
											profile page
										</A>{" "}
										to manage these settings.
									</Text>
								</Stack>
							</section>

							<section>
								<Heading level="h2" class="mb-2">
									Account Deletion
								</Heading>
								<Text>
									When you delete your account, your personal information
									(email, username) is permanently removed. Projects you created
									remain visible but are attributed to "Deleted User" to
									preserve community content.
								</Text>
							</section>

							<section>
								<Heading level="h2" class="mb-2">
									User-Generated Content
								</Heading>
								<Stack spacing="sm">
									<Text>
										You are responsible for the content you post, including
										project names and descriptions. Do not include sensitive
										personal information (phone numbers, addresses, etc.) in
										public fields.
									</Text>
									<Text>
										Content you publish voluntarily is not personal data we
										collected on your behalf. On account deletion, this content
										is anonymized but not removed.
									</Text>
								</Stack>
							</section>

							<section>
								<Heading level="h2" class="mb-2">
									Data Storage & Authentication
								</Heading>
								<Stack spacing="sm">
									<Text>
										Your TechGarden data is stored securely. Authentication is
										handled separately by our identity provider (Zitadel).
									</Text>
									<Text>
										When you delete your TechGarden account, your data on this
										platform is removed. Your identity provider account remains
										intact and can be managed separately through its own
										settings.
									</Text>
								</Stack>
							</section>
						</Stack>
					</Card>
				</Stack>
			</Container>
		</Layout>
	);
};
