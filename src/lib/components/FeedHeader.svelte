<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { FileJson, Search, X } from '@lucide/svelte';
	import { search } from '$lib/store.svelte';

	let {
		onExport
	}: { onExport: () => void } = $props();

	let isSearching = $state(false);

	function toggleSearch() {
		isSearching = !isSearching;
		if (!isSearching) {
			search.query = '';
		}
	}
</script>

<header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
	<div class="flex h-14 items-center justify-between px-4">
		{#if isSearching}
			<div class="flex flex-1 items-center gap-2">
				<Search class="h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search links..."
					class="h-9 border-none bg-transparent p-0 focus-visible:ring-0"
					bind:value={search.query}
					autofocus
				/>
				<Button variant="ghost" size="icon" class="h-8 w-8" onclick={toggleSearch}>
					<X class="h-4 w-4" />
				</Button>
			</div>
		{:else}
			<h1 class="text-xl font-bold tracking-tight">Home</h1>
			<div class="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon"
					class="flex xl:hidden"
					onclick={toggleSearch}
					title="Search"
				>
					<Search class="h-5 w-5" />
				</Button>
				<Button variant="ghost" size="icon" onclick={onExport} title="Export">
					<FileJson class="h-5 w-5" />
				</Button>
			</div>
		{/if}
	</div>
</header>