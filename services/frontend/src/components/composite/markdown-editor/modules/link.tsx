import { Icon } from "@/components/primitives/icon";
import { Input } from "@/components/primitives/input";
import { Button } from "@/components/ui/button";
import type { ToolbarModule } from "../markdown-editor-types";

const URL_PATTERN = /^https?:\/\/\S+$/i;

const isUrl = (text: string) => URL_PATTERN.test(text.trim());

export const linkModule: ToolbarModule = {
	id: "link",
	label: "Link",
	icon: () => (
		<Icon class="w-4 h-4 md:w-5 md:h-5">
			<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
			<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
		</Icon>
	),
	panel: (ctx) => {
		const selected = ctx.getSelectedText().trim();
		const initialText = isUrl(selected) ? "" : selected;
		const initialUrl = isUrl(selected) ? selected : "";

		let urlInput: HTMLInputElement | undefined;
		let textInput: HTMLInputElement | undefined;

		const handleInsert = () => {
			const url = urlInput?.value.trim() || "";
			const text = textInput?.value.trim() || url;
			if (url) {
				ctx.insert(`[${text}](${url})`);
				ctx.closePanel();
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				handleInsert();
			}
		};

		// Focus the appropriate input after render
		setTimeout(() => {
			if (initialText) {
				urlInput?.focus();
			} else {
				textInput?.focus();
			}
		}, 0);

		return (
			<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
				<Input
					ref={textInput}
					type="text"
					size="sm"
					placeholder="Link text"
					aria-label="Link text"
					class="w-full sm:w-auto"
					value={initialText}
					onKeyDown={handleKeyDown}
				/>
				<Input
					ref={urlInput}
					type="url"
					size="sm"
					placeholder="https://..."
					aria-label="Link URL"
					class="w-full sm:flex-1"
					value={initialUrl}
					onKeyDown={handleKeyDown}
				/>
				<Button type="button" size="sm" onClick={handleInsert}>
					Insert
				</Button>
			</div>
		);
	},
};
