<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { FileJson, FileText } from '@lucide/svelte';
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
			if (link.aiSummary) {
				markdown += `**AI Summary:** ${link.aiSummary}\n\n`;
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

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md space-y-4 rounded-lg bg-background p-6 shadow-lg">
			<h2 class="text-xl font-semibold">Export Links</h2>
			<p class="text-sm text-muted-foreground">Export your links as JSON or Markdown</p>
			<div class="grid gap-2">
				<Button variant="outline" onclick={exportToJSON}>
					<FileJson class="mr-2 h-4 w-4" />
					Export as JSON
				</Button>
				<Button variant="outline" onclick={exportToMarkdown}>
					<FileText class="mr-2 h-4 w-4" />
					Export as Markdown
				</Button>
			</div>
			<Button variant="ghost" onclick={() => (open = false)}>Cancel</Button>
		</div>
	</div>
{/if}
