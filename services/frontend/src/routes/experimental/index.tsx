import { createSignal, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Button } from "@/components/ui/button";
import {
	TextField,
	TextFieldInput,
	TextFieldLabel,
} from "@/components/ui/text-field";
import { Layout } from "@/layout/Layout";
import { MarkdownInput } from "./components/markdown-input";
import { MarkdownOutput } from "./components/markdown-output";

const INITIAL_MARKDOWN = `# Syntax Highlighting Demo

Various code snippets to test syntax highlighting.

## TypeScript

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

async function fetchUser(id: string): Promise<User | null> {
  const response = await fetch(\`/api/users/\${id}\`);

  if (!response.ok) {
    console.error("Failed to fetch user:", response.status);
    return null;
  }

  return response.json();
}

const users: User[] = [];
const isActive = true;
const count = 42;
\`\`\`

## JavaScript

\`\`\`javascript
// React component example
function Button({ onClick, children, variant = "primary" }) {
  const styles = {
    primary: "bg-blue-500 text-white",
    secondary: "bg-gray-200 text-gray-800",
  };

  return (
    <button
      className={styles[variant]}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
\`\`\`

## Python

\`\`\`python
from dataclasses import dataclass
from typing import Optional
import asyncio

@dataclass
class Package:
    name: str
    version: str
    downloads: int = 0

async def fetch_packages(registry: str) -> list[Package]:
    """Fetch all packages from a registry."""
    packages = []
    async with aiohttp.ClientSession() as session:
        response = await session.get(f"https://{registry}/packages")
        data = await response.json()

        for item in data["packages"]:
            packages.append(Package(**item))

    return packages

if __name__ == "__main__":
    result = asyncio.run(fetch_packages("npm"))
    print(f"Found {len(result)} packages")
\`\`\`

## SQL

\`\`\`sql
-- Find most popular packages
SELECT
    p.name,
    p.registry,
    COUNT(u.id) as upvotes,
    p.created_at
FROM packages p
LEFT JOIN upvotes u ON u.package_id = p.id
WHERE p.registry IN ('npm', 'jsr')
  AND p.created_at > NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name, p.registry, p.created_at
HAVING COUNT(u.id) > 10
ORDER BY upvotes DESC
LIMIT 20;
\`\`\`

## JSON

\`\`\`json
{
  "name": "@techgarden/core",
  "version": "1.0.0",
  "dependencies": {
    "solid-js": "^1.8.0",
    "hono": "^4.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/techgarden/core"
  }
}
\`\`\`

## Bash

\`\`\`bash
#!/bin/bash

# Deploy script
set -e

echo "Building application..."
pnpm build

if [ -z "$DEPLOY_ENV" ]; then
  DEPLOY_ENV="staging"
fi

echo "Deploying to $DEPLOY_ENV..."
docker build -t app:latest .
docker push registry.example.com/app:latest

# Notify on success
curl -X POST "$WEBHOOK_URL" \\
  -H "Content-Type: application/json" \\
  -d '{"status": "deployed", "env": "'$DEPLOY_ENV'"}'
\`\`\`

## CSS

\`\`\`css
.card {
  --card-padding: 1.5rem;

  display: flex;
  flex-direction: column;
  padding: var(--card-padding);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .card {
    --card-padding: 1rem;
  }
}
\`\`\`

## Inline code

You can also use \`inline code\` like \`const x = 42\` within paragraphs.
`;

export const Experimental = () => {
	const [input, setInput] = createSignal(INITIAL_MARKDOWN);
	let textareaRef: HTMLTextAreaElement | undefined;

	const insertAtCursor = (text: string) => {
		if (!textareaRef) return;

		textareaRef.focus();

		// execCommand("insertText") preserves the browser's native undo stack,
		// so Ctrl+Z works as expected. While technically deprecated since ~2015,
		// it still works in all browsers and has no replacement API for
		// programmatic text insertion with undo support. If browsers ever
		// remove it, we'd need to implement a custom undo stack.
		document.execCommand("insertText", false, text);

		// Sync our state with the new value
		setInput(textareaRef.value);
	};

	const insertCodeBlock = () => {
		insertAtCursor("\n```typescript\n\n```\n");
	};

	const [linkText, setLinkText] = createSignal("");
	const [linkUrl, setLinkUrl] = createSignal("");
	const [linkOpen, setLinkOpen] = createSignal(false);

	const insertLink = () => {
		const text = linkText() || linkUrl();
		const url = linkUrl();
		if (url) {
			insertAtCursor(`[${text}](${url})`);
		}
		setLinkText("");
		setLinkUrl("");
		setLinkOpen(false);
	};

	return (
		<Layout>
			<Container size="lg">
				<Stack spacing="lg" class="py-8">
					<Heading level="h1">Markdown Experiment</Heading>

					<div class="grid grid-cols-2 gap-8 h-[calc(100vh-250px)]">
						<div class="flex flex-col gap-3">
							<div class="flex items-center justify-between">
								<label class="text-sm font-medium text-on-surface dark:text-on-surface-dark">
									Markdown Input
								</label>
								<div class="flex gap-2">
									<Button
										size="sm"
										variant="secondary"
										onClick={() => setLinkOpen(!linkOpen())}
									>
										Link
									</Button>
									<Button
										size="sm"
										variant="secondary"
										onClick={insertCodeBlock}
									>
										Code Block
									</Button>
								</div>
							</div>
							<Show when={linkOpen()}>
								<div class="p-4 rounded-lg border border-outline dark:border-outline-dark bg-surface-alt dark:bg-surface-dark-alt">
									<Stack spacing="sm">
										<Flex gap="sm">
											<TextField class="flex-1">
												<TextFieldLabel>Text (optional)</TextFieldLabel>
												<TextFieldInput
													value={linkText()}
													onInput={(e) => setLinkText(e.currentTarget.value)}
												/>
											</TextField>
											<TextField class="flex-1">
												<TextFieldLabel>URL</TextFieldLabel>
												<TextFieldInput
													value={linkUrl()}
													onInput={(e) => setLinkUrl(e.currentTarget.value)}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															insertLink();
														}
													}}
												/>
											</TextField>
										</Flex>
										<Flex justify="end" gap="sm">
											<Button
												size="sm"
												variant="secondary"
												onClick={() => setLinkOpen(false)}
											>
												Cancel
											</Button>
											<Button size="sm" onClick={insertLink}>
												Insert Link
											</Button>
										</Flex>
									</Stack>
								</div>
							</Show>
							<MarkdownInput
								ref={(el) => {
									textareaRef = el;
								}}
								class="flex-1"
								value={input()}
								onInput={setInput}
							/>
						</div>

						<div class="flex flex-col gap-3">
							<label class="text-sm font-medium text-on-surface dark:text-on-surface-dark">
								Rendered Output
							</label>
							<div class="flex-1 p-6 rounded-lg overflow-auto bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark">
								<MarkdownOutput markdown={input()} />
							</div>
						</div>
					</div>
				</Stack>
			</Container>
		</Layout>
	);
};
