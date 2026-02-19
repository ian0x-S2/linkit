<script lang="ts">
	import { cn } from '$lib/utils';
	import LazyStatusBar from '$lib/components/tui/LazyStatusBar.svelte';
	import type { Snippet } from 'svelte';

	let {
		children,
		class: className,
		showStatusBar = true
	}: {
		children?: Snippet;
		class?: string;
		showStatusBar?: boolean;
	} = $props();
</script>

<div
	class={cn(
		'relative my-2 flex flex-1 overflow-hidden border-2 border-border shadow-xs',
		className
	)}
>
	{@render children?.()}

	{#if showStatusBar}
		<div class="absolute bottom-0 left-0 z-40 hidden w-full md:flex">
			<LazyStatusBar />
		</div>
	{/if}
</div>
