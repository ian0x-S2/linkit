<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { FileJson } from '@lucide/svelte';

	let {
		onExport
	}: { onExport: () => void } = $props();
</script>

<header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
	<div class="flex h-14 items-center justify-between px-4">
		<h1 class="text-xl font-bold tracking-tight">Home</h1>
		<div class="flex items-center gap-1">
			<Button variant="ghost" size="icon" onclick={onExport} title="Export">
				<FileJson class="h-5 w-5" />
			</Button>
		</div>
	</div>
</header>