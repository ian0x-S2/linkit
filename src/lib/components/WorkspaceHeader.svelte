<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { 
		FileJson, 
		Plus, 
		Search, 
		List, 
		LayoutGrid, 
		ChevronRight,
		Inbox,
		Settings2
	} from '@lucide/svelte';
	import { search } from '$lib/store.svelte';
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	let {
		title = 'Inbox',
		onExport,
		onAddLink,
		viewMode = $bindable('list')
	}: { 
		title?: string;
		onExport: () => void;
		onAddLink: () => void;
		viewMode?: 'list' | 'grid';
	} = $props();
</script>

<header class="bg-background px-4 py-3 shrink-0 border-b">
	<div class="flex items-center justify-between gap-4">
		<!-- Left: Trigger, Breadcrumbs & Title -->
		<div class="flex items-center gap-2 min-w-0">
			<Sidebar.Trigger class="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" />
			<div class="h-4 w-[1px] bg-border shrink-0 mx-1"></div>
			
			<nav class="flex items-center gap-2 text-xs font-medium text-muted-foreground min-w-0">
				<div class="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors shrink-0">
					<Inbox class="h-3.5 w-3.5" />
					<span>Library</span>
				</div>
				<ChevronRight class="h-3.5 w-3.5 opacity-20 shrink-0" />
				<span class="text-foreground font-bold text-sm truncate">{title}</span>
			</nav>
		</div>

		<!-- Right: Actions -->
		<div class="flex items-center gap-2 shrink-0">
			<Button 
				variant="ghost" 
				size="sm" 
				class="h-8 gap-2 text-muted-foreground hover:text-foreground px-2"
				onclick={onExport}
			>
				<FileJson class="h-4 w-4" />
				<span class="hidden sm:inline text-[11px] font-medium">Export</span>
			</Button>
			<Button 
				size="sm" 
				class="h-8 gap-2 px-3 shadow-sm"
				onclick={onAddLink}
			>
				<Plus class="h-4 w-4" />
				<span class="text-[11px] font-medium">Add Link</span>
			</Button>
		</div>
	</div>

	<!-- Search & View Controls (Secondary Row) -->
	<div class="mt-3 flex items-center justify-between gap-4">
		<div class="relative max-w-md flex-1">
			<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
			<Input
				bind:value={search.query}
				placeholder="Search links, tags, or domains..."
				class="h-8 w-full border-none bg-muted/50 pl-10 text-sm shadow-none focus-visible:ring-1"
			/>
		</div>

		<div class="flex items-center gap-1 rounded-lg border bg-muted/20 p-0.5 shrink-0">
			<Button
				variant={viewMode === 'list' ? 'secondary' : 'ghost'}
				size="icon"
				class="h-7 w-7 rounded-md"
				onclick={() => (viewMode = 'list')}
			>
				<List class="h-4 w-4" />
			</Button>
			<Button
				variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
				size="icon"
				class="h-7 w-7 rounded-md"
				onclick={() => (viewMode = 'grid')}
			>
				<LayoutGrid class="h-4 w-4" />
			</Button>
			<div class="mx-1 h-4 w-[1px] bg-border"></div>
			<Button variant="ghost" size="icon" class="h-7 w-7 rounded-md">
				<Settings2 class="h-4 w-4 text-muted-foreground" />
			</Button>
		</div>
	</div>
</header>