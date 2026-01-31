import { createSignal } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Button } from "@/components/ui/button";
import {
	TextField,
	TextFieldInput,
	TextFieldLabel,
} from "@/components/ui/text-field";
import type { ToolbarContext, ToolbarModule } from "../toolbar-types";

const LinkIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
		<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
	</svg>
);

const LinkPanel = (ctx: ToolbarContext) => {
	const [text, setText] = createSignal("");
	const [url, setUrl] = createSignal("");

	const handleInsert = () => {
		const linkText = text() || url();
		const linkUrl = url();
		if (linkUrl) {
			ctx.insert(`[${linkText}](${linkUrl})`);
		}
		setText("");
		setUrl("");
		ctx.closePanel();
	};

	return (
		<Flex gap="sm" align="end">
			<TextField class="flex-1">
				<TextFieldLabel class="text-xs">Text</TextFieldLabel>
				<TextFieldInput
					value={text()}
					onInput={(e) => setText(e.currentTarget.value)}
					placeholder="optional"
				/>
			</TextField>
			<TextField class="flex-1">
				<TextFieldLabel class="text-xs">URL</TextFieldLabel>
				<TextFieldInput
					value={url()}
					onInput={(e) => setUrl(e.currentTarget.value)}
					placeholder="https://..."
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							handleInsert();
						}
					}}
				/>
			</TextField>
			<Button size="sm" onClick={handleInsert}>
				Add
			</Button>
		</Flex>
	);
};

export const linkModule: ToolbarModule = {
	id: "link",
	label: "Link",
	icon: <LinkIcon />,
	panel: LinkPanel,
};
