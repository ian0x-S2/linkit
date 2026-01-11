<script lang="ts">
	import { Search } from '@lucide/svelte';
	import { search, selectedTags } from '$lib/store.svelte';
</script>

<div class="flex flex-col items-center justify-center p-12 text-center">
	<Search class="mb-4 h-12 w-12 text-muted-foreground" />
	<h3 class="text-lg font-semibold">No links found</h3>
	<p class="text-muted-foreground">
		{#if search.query || selectedTags.length > 0}
			Try adjusting your search or filters
		{:else}
			Add your first link to get started
		{/if}
	</p>
</div>
