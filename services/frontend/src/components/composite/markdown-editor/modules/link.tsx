import { Icon } from "@/components/primitives/icon";
import { Input } from "@/components/primitives/input";
import { Button } from "@/components/ui/button";
import type { ToolbarModule } from "../markdown-editor-types";

export const linkModule: ToolbarModule = {
	id: "link",
	label: "Insert Link",
	icon: () => (
		<Icon size="sm">
			<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
			<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
		</Icon>
	),
	panel: (ctx) => {
		let urlInput: HTMLInputElement | undefined;
		let textInput: HTMLInputElement | undefined;

		const handleInsert = () => {
			const url = urlInput?.value || "";
			const text = textInput?.value || url;
			if (url) {
				ctx.insert(`[${text}](${url})`);
				ctx.closePanel();
			}
		};

		return (
			<div class="flex items-center gap-2">
				<Input
					ref={textInput}
					type="text"
					size="sm"
					placeholder="Link text"
					aria-label="Link text"
					class="w-auto"
				/>
				<Input
					ref={urlInput}
					type="url"
					size="sm"
					placeholder="https://..."
					aria-label="Link URL"
					class="flex-1"
				/>
				<Button type="button" size="sm" onClick={handleInsert}>
					Insert
				</Button>
			</div>
		);
	},
};
