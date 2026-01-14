<script lang="ts">
	import type { Link } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { 
		Edit2, 
		Trash2, 
		MoreHorizontal,
		FileText
	} from '@lucide/svelte';
	import { formatDistanceToNow } from 'date-fns';
	import * as Popover from '$lib/components/ui/popover';

	interface Props {
		link: Link;
		onedit: (link: Link) => void;
		ondelete: (id: string) => void;
	}

	let { link, onedit, ondelete }: Props = $props();

	let imageError = $state(false);
	let actionsOpen = $state(false);

	function getDomain(url: string) {
		try {
			return new URL(url).hostname.replace('www.', '');
		} catch {
			return url;
		}
	}
</script>

<div class="group border-b bg-background transition-all hover:bg-muted/[0.03]">
	<div class="flex items-center gap-4 px-4 py-2.5">
		<!-- Preview: More Geometric -->
		<div class="shrink-0">
			<div class="flex h-10 w-10 items-center justify-center rounded-md border bg-muted/20 text-muted-foreground shadow-sm overflow-hidden group-hover:border-border transition-colors">
				{#if link.image && !imageError}
					<img
						src={link.image}
						alt=""
						class="h-full w-full object-cover"
						onerror={() => (imageError = true)}
					/>
				{:else}
					<FileText class="h-4.5 w-4.5 opacity-30" />
				{/if}
			</div>
		</div>

		<!-- Content: High Precision -->
		<div class="min-w-0 flex-1 flex items-center gap-6">
			<div class="min-w-0 flex-1 py-0.5">
				<div class="flex flex-col gap-0.5">
					<div class="flex items-center gap-2">
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class="text-[13.5px] font-semibold leading-tight text-foreground hover:text-primary transition-colors truncate"
						>
							{link.title || link.url}
						</a>
						<span class="text-[11px] text-muted-foreground/40 font-medium shrink-0">
							{getDomain(link.url)}
						</span>
					</div>
					{#if link.description}
						<p class="text-[12.5px] text-muted-foreground/60 line-clamp-1 font-normal leading-normal">
							{link.description}
						</p>
					{/if}
				</div>
			</div>

			<!-- Tags: Rectangular (Linear) -->
			<div class="hidden lg:flex items-center gap-1 shrink-0 max-w-[240px] overflow-hidden">
				{#each link.tags as tag (tag)}
					<Badge
						variant="secondary"
						class="h-5 px-1.5 text-[10px] font-medium bg-muted/40 text-muted-foreground/80 border border-transparent hover:border-border transition-all rounded-[4px]"
					>
						{tag}
					</Badge>
				{/each}
			</div>

			<!-- Metadata -->
			<div class="hidden sm:block shrink-0 w-24 text-[11px] text-muted-foreground/40 text-right font-medium">
				{formatDistanceToNow(link.createdAt, { addSuffix: true })}
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
				<Popover.Root bind:open={actionsOpen}>
					<Popover.Trigger asChild>
						{#snippet children(props)}
							<Button 
								variant="ghost" 
								size="icon" 
								class="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
								{...props}
							>
								<MoreHorizontal class="h-3.5 w-3.5" />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content align="end" class="w-40 p-1 shadow-md rounded-lg">
						<div class="flex flex-col gap-0.5">
							<Button 
								variant="ghost" 
								size="sm" 
								class="justify-start h-8 px-2 text-[12px] font-medium rounded-md"
								onclick={() => { onedit(link); actionsOpen = false; }}
							>
								<Edit2 class="mr-2 h-3 w-3" />
								<span>Edit</span>
							</Button>
							<div class="h-[1px] bg-border my-1"></div>
							<Button 
								variant="ghost" 
								size="sm" 
								class="justify-start h-8 px-2 text-[12px] font-medium text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md"
								onclick={() => { ondelete(link.id); actionsOpen = false; }}
							>
								<Trash2 class="mr-2 h-3 w-3" />
								<span>Delete</span>
							</Button>
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>
		</div>
	</div>
</div>