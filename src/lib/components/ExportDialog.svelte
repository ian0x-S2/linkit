<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { FileBraces, FileText, X } from '@lucide/svelte';
	import type { Link } from '$lib/types';

	let { open = $bindable(false), links }: { open: boolean; links: Link[] } = $props();

	async function exportToJSON() {
		const data = JSON.stringify(links, null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `links-export-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
		open = false;
	}

	async function exportToMarkdown() {
		let markdown = '# Links Export\n\n';
		links.forEach((link) => {
			markdown += `## ${link.title || link.url}\n\n`;
			markdown += `${link.url}\n\n`;
			if (link.description) {
				markdown += `${link.description}\n\n`;
			}
			if (link.tags.length > 0) {
				markdown += `Tags: ${link.tags.join(', ')}\n\n`;
			}
			markdown += '---\n\n';
		});
		const blob = new Blob([markdown], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `links-export-${Date.now()}.md`;
		a.click();
		URL.revokeObjectURL(url);
		open = false;
	}
</script>

<div class="flex flex-col bg-background text-foreground">
	<!-- Header -->
	<div class="flex h-11 items-center justify-between border-b border-border px-4">
		<h2 class="text-[13px] font-semibold tracking-tight text-foreground/90">Export Workspace</h2>
		<Button
			variant="ghost"
			size="icon"
			onclick={() => (open = false)}
			class="h-7 w-7 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
		>
			<X class="h-3.5 w-3.5" />
		</Button>
	</div>

	<!-- Body -->
	<div class="flex-1 space-y-4 px-4 py-4">
		<p class="text-[12px] leading-relaxed text-muted-foreground">
			Download your collection as a portable file. Your data stays private and local.
		</p>

		<div class="grid gap-2.5">
			<button
				class="group flex items-center justify-between rounded-sm border border-border/60 bg-muted/10 p-3 transition-all hover:border-primary/30 hover:bg-muted/20"
				onclick={exportToJSON}
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-background shadow-sm transition-colors group-hover:border-primary/20"
					>
						<FileBraces
							class="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
						/>
					</div>
					<div class="text-left">
						<p class="text-[13px] leading-none font-medium">JSON Data</p>
						<p class="mt-1 text-[11px] text-muted-foreground/60">
							Best for backups and machine reading.
						</p>
					</div>
				</div>
			</button>

			<button
				class="group flex items-center justify-between rounded-sm border border-border/60 bg-muted/10 p-3 transition-all hover:border-primary/30 hover:bg-muted/20"
				onclick={exportToMarkdown}
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-background shadow-sm transition-colors group-hover:border-primary/20"
					>
						<FileText
							class="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
						/>
					</div>
					<div class="text-left">
						<p class="text-[13px] leading-none font-medium">Markdown Document</p>
						<p class="mt-1 text-[11px] text-muted-foreground/60">
							Best for reading and documentation.
						</p>
					</div>
				</div>
			</button>
		</div>
	</div>

	<!-- Footer -->
	<div class="flex items-center justify-end gap-2 border-t border-border px-4 py-2.5">
		<Button
			variant="ghost"
			onclick={() => (open = false)}
			class="h-8 rounded-sm px-3 text-[12px] font-medium text-muted-foreground hover:text-foreground"
		>
			Cancel
		</Button>
	</div>
</div>
