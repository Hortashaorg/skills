import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Layout } from "@/layout/Layout";
import { type Comment, CommentThread } from "./components/discussion";
import { codeBlockModule, linkModule } from "./components/toolbar";

const CURRENT_USER = "sarah_dev";

// Comments sorted newest-first (top-level), replies sorted chronologically
const MOCK_COMMENTS: Comment[] = [
	{
		id: "4",
		author: "alex_maintainer",
		avatar: "A",
		timestamp: "30 min ago",
		content: `> Should we open an issue about this? Feels like it should be documented.

Great catch! I've added this to the docs in the latest release.

> I'm getting some weird behavior with the ESM imports.

This should be fixed in v2.1.1 as well. Thanks for reporting everyone!`,
	},
	{
		id: "1",
		author: "sarah_dev",
		avatar: "S",
		timestamp: "2 hours ago",
		content: `Has anyone tried using this package with **Bun**? I'm getting some weird behavior with the ESM imports.

\`\`\`typescript
import { createClient } from "@package/core";

// This throws: "Cannot find module"
const client = createClient({ timeout: 5000 });
\`\`\`

Any ideas?`,
		replies: [
			{
				id: "2",
				author: "mike_js",
				avatar: "M",
				timestamp: "1 hour ago",
				replyToAuthor: "sarah_dev",
				content: `I had the same issue! The fix is to add this to your \`bunfig.toml\`:

\`\`\`toml
[install]
peer = false
\`\`\`

Then reinstall. Worked for me.`,
			},
			{
				id: "3",
				author: "sarah_dev",
				avatar: "S",
				timestamp: "45 min ago",
				replyToAuthor: "mike_js",
				editedAt: "40 min ago",
				content: `> Then reinstall. Worked for me.

That worked! Thanks so much. Should we open an issue about this? Feels like it should be documented.`,
			},
		],
	},
];

const modules = [linkModule, codeBlockModule];

export const Experimental = () => {
	const handleSubmit = (content: string, replyTo: Comment | null) => {
		console.log("New comment:", content, "Reply to:", replyTo);
	};

	const handleEdit = (comment: Comment, newContent: string) => {
		console.log("Edit comment:", comment.id, "New content:", newContent);
	};

	return (
		<Layout>
			<Container size="md">
				<Stack spacing="lg" class="py-8">
					<Heading level="h1">Discussion Thread</Heading>

					<p class="text-on-surface/70 dark:text-on-surface-dark/70">
						Package: <span class="font-mono">@package/core</span> v2.1.0
					</p>

					<CommentThread
						comments={MOCK_COMMENTS}
						currentUser={CURRENT_USER}
						onSubmit={handleSubmit}
						onEdit={handleEdit}
						modules={modules}
					/>
				</Stack>
			</Container>
		</Layout>
	);
};
