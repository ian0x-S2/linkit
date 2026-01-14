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

<header class="border-b bg-background px-6 py-3">
	<div class="flex flex-col gap-4">
		<!-- Top Row: Breadcrumbs and Actions -->
		<div class="flex items-center justify-between">
			<nav class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
				<div class="flex items-center gap-1.5 hover:text-foreground cursor-pointer">
					<Inbox class="h-4 w-4" />
					<span>Library</span>
				</div>
				<ChevronRight class="h-4 w-4 opacity-50" />
				<span class="text-foreground font-semibold">{title}</span>
			</nav>

			<div class="flex items-center gap-2">
				<Button 
					variant="outline" 
					size="sm" 
					class="h-8 gap-2 border-dashed"
					onclick={onExport}
				>
					<FileJson class="h-4 w-4" />
					<span>Export</span>
				</Button>
				<Button 
					size="sm" 
					class="h-8 gap-2 shadow-sm"
					onclick={onAddLink}
				>
					<Plus class="h-4 w-4" />
					<span>Add Link</span>
				</Button>
			</div>
		</div>

		<!-- Bottom Row: Search and View Controls -->
		<div class="flex items-center justify-between gap-4">
			<div class="relative max-w-md flex-1">
				<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
				<Input
					bind:value={search.query}
					placeholder="Search links, tags, or domains..."
					class="h-9 w-full border-none bg-muted/50 pl-10 text-sm shadow-none focus-visible:ring-1"
				/>
			</div>

			<div class="flex items-center gap-1 rounded-lg border bg-muted/20 p-1">
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
	</div>
</header>