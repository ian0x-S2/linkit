<script lang="ts">
	import { Search, Hash } from '@lucide/svelte';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		search,
		selectedTags,
		getAllTags,
		toggleSelectedTag,
		clearSelectedTags
	} from '$lib/store.svelte';
</script>

<aside class="sticky top-0 h-screen w-full max-w-[350px] overflow-y-auto py-4 pr-4 pl-10 space-y-6">
	<!-- Search Box -->
	<div class="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-2 pt-2">
		<div class="relative">
			<Search class="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				bind:value={search.query}
				placeholder="Search links..."
				class="h-11 rounded-full border-none bg-muted/50 pl-11 focus-visible:ring-primary"
			/>
		</div>
	</div>

	<!-- Tags / Filtering -->
	{#if getAllTags().length > 0}
		<div class="rounded-2xl border bg-card p-4 shadow-sm">
			<div class="flex items-center justify-between mb-4 px-1">
				<h2 class="text-lg font-bold tracking-tight">Filter by Tags</h2>
				{#if selectedTags.length > 0}
					<Button 
						variant="link" 
						size="sm" 
						class="h-auto p-0 text-xs text-primary" 
						onclick={clearSelectedTags}
					>
						Clear all
					</Button>
				{/if}
			</div>
			<div class="flex flex-wrap gap-2">
				{#each getAllTags() as tag}
					<Badge
						variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
						class="cursor-pointer rounded-md border-none px-3 py-1.5 text-xs transition-all hover:scale-105"
						onclick={() => toggleSelectedTag(tag)}
					>
						#{tag}
					</Badge>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Trends Section -->
	<div class="rounded-2xl border bg-card p-4 shadow-sm">
		<h2 class="mb-4 px-1 text-lg font-bold tracking-tight">What's happening</h2>
		<div class="space-y-4">
			<div class="group cursor-pointer px-1 py-1 transition-colors">
				<p class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
					Trending in Tech
				</p>
				<p class="text-[15px] font-bold transition-colors group-hover:text-primary">
					#Svelte5
				</p>
				<p class="text-[11px] text-muted-foreground">1,234 links</p>
			</div>
			<div class="group cursor-pointer px-1 py-1 transition-colors">
				<p class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
					Local-first Apps
				</p>
				<p class="text-[15px] font-bold transition-colors group-hover:text-primary">
					#BunRuntime
				</p>
				<p class="text-[11px] text-muted-foreground">856 links</p>
			</div>
		</div>
		<Button variant="link" class="mt-2 h-auto p-1 text-sm font-medium text-primary">
			Show more
		</Button>
	</div>
</aside>
