<script lang="ts">
	import type { Link } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import {
		Trash2,
		FileText,
		ExternalLink,
		Star,
		Archive,
		RotateCcw,
		Ellipsis,
		Pencil
	} from '@lucide/svelte';
	import { formatDistanceToNow } from 'date-fns';
	import * as Popover from '$lib/components/ui/popover';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import { cn } from '$lib/utils';

	interface Props {
		link: Link;
		onedit: (link: Link) => void;
		ondelete: (id: string) => void;
	}

	let { link, onedit, ondelete }: Props = $props();
	const store = getContext<AppStore>('store');
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

<div class="group flex flex-col px-4 py-3 transition-colors hover:bg-muted/30">
	<div class="flex gap-3">
		<!-- Left: Icon/Avatar -->
		<div class="flex flex-col items-center shrink-0">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/20"
			>
				{#if link.image && !imageError}
					<img
						src={link.image}
						alt=""
						class="h-full w-full rounded-md object-cover"
						onerror={() => (imageError = true)}
					/>
				{:else}
					<FileText class="h-4.5 w-4.5" />
				{/if}
			</div>
		</div>

		<!-- Right: Content -->
		<div class="flex min-w-0 flex-1 flex-col gap-0.5">
			<!-- Header: Title & Meta -->
			<div class="flex items-center justify-between gap-2">
				<div class="flex items-center gap-1.5 min-w-0">
					<span class="truncate text-[14px] font-bold leading-tight text-foreground">
						{getDomain(link.url)}
					</span>
					<span class="shrink-0 text-[14px] text-muted-foreground">·</span>
					<span class="shrink-0 text-[13px] text-muted-foreground">
						{formatDistanceToNow(link.createdAt, { addSuffix: false })}
					</span>
				</div>

				<Popover.Root bind:open={actionsOpen}>
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'ghost', size: 'icon' }),
							'h-7 w-7 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary'
						)}
					>
						<Ellipsis class="h-3.5 w-3.5" />
					</Popover.Trigger>
					<Popover.Content align="end" class="w-52 rounded-md border p-1 shadow-xl">
						<div class="flex flex-col gap-0.5">
							<Button
								variant="ghost"
								size="sm"
								class="h-9 justify-start rounded-md px-2.5 text-[13px] font-bold"
								onclick={() => {
									onedit(link);
									actionsOpen = false;
								}}
							>
								<Pencil class="mr-2.5 h-3.5 w-3.5" />
								<span>Edit link</span>
							</Button>

							{#if !link.isDeleted}
								<Button
									variant="ghost"
									size="sm"
									class="h-9 justify-start rounded-md px-2.5 text-[13px] font-bold {link.isFavorite
										? 'text-yellow-500'
										: ''}"
									onclick={() => {
										store.links.toggleFavorite(link.id);
										actionsOpen = false;
									}}
								>
									<Star class="mr-2.5 h-3.5 w-3.5 {link.isFavorite ? 'fill-current' : ''}" />
									<span>{link.isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
								</Button>

								<Button
									variant="ghost"
									size="sm"
									class="h-9 justify-start rounded-md px-2.5 text-[13px] font-bold"
									onclick={() => {
										store.links.toggleArchived(link.id);
										actionsOpen = false;
									}}
								>
									<Archive class="mr-2.5 h-3.5 w-3.5" />
									<span>{link.isArchived ? 'Move to inbox' : 'Archive link'}</span>
								</Button>
							{/if}

							<div class="my-1 h-px bg-border/40"></div>

							<Button
								variant="ghost"
								size="sm"
								class="h-9 justify-start rounded-md px-2.5 text-[13px] font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
								onclick={() => {
									if (link.isDeleted) {
										ondelete(link.id);
									} else {
										store.links.toggleDeleted(link.id);
									}
									actionsOpen = false;
								}}
							>
								<Trash2 class="mr-2.5 h-3.5 w-3.5" />
								<span>{link.isDeleted ? 'Delete permanently' : 'Move to trash'}</span>
							</Button>
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>

			<!-- Main Text -->
			<a
				href={link.url}
				target="_blank"
				rel="noopener noreferrer"
				class="text-[14px] leading-snug text-foreground group-hover:underline decoration-foreground/20"
			>
				<span class="font-bold block mb-0.5">{link.title || link.url}</span>
				{#if link.description}
					<p class="text-[14px] text-muted-foreground leading-snug line-clamp-2">
						{link.description}
					</p>
				{/if}
			</a>

			<!-- Attachment: Image Preview -->
			{#if link.image && !imageError}
				<a
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
					class="mt-2 block overflow-hidden rounded-md border border-border transition-colors hover:bg-muted/10"
				>
					<div class="aspect-[2/1] w-full bg-muted/20">
						<img src={link.image} alt="" class="h-full w-full object-cover" />
					</div>
					<div class="p-2 border-t border-border/40">
						<div class="flex items-center gap-1.5 text-[12px] text-muted-foreground">
							<ExternalLink class="h-3 w-3" />
							<span class="truncate">{getDomain(link.url)}</span>
						</div>
					</div>
				</a>
			{/if}

			<!-- Tags -->
			{#if link.tags.length > 0}
				<div class="mt-1.5 flex flex-wrap gap-1.5">
					{#each link.tags as tag (tag)}
						<button
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								store.filters.toggleTag(tag);
							}}
							class="text-[13px] text-primary hover:underline font-medium"
						>
							#{tag}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Actions: Bottom Row -->
			<div class="mt-2 flex items-center justify-between max-w-sm -ml-1.5">
				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
					onclick={(e) => {
						e.preventDefault();
						window.open(link.url, '_blank');
					}}
				>
					<ExternalLink class="h-4 w-4" />
				</Button>

				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8 rounded-md {link.isFavorite
						? 'text-yellow-500'
						: 'text-muted-foreground'} hover:bg-yellow-500/10 hover:text-yellow-500 transition-colors"
					onclick={(e) => {
						e.preventDefault();
						store.links.toggleFavorite(link.id);
					}}
				>
					<Star class="h-4 w-4 {link.isFavorite ? 'fill-current' : ''}" />
				</Button>

				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8 rounded-md {link.isArchived
						? 'text-primary'
						: 'text-muted-foreground'} hover:bg-primary/10 hover:text-primary transition-colors"
					onclick={(e) => {
						e.preventDefault();
						store.links.toggleArchived(link.id);
					}}
				>
					<Archive class="h-4 w-4" />
				</Button>

				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
					onclick={(e) => {
						e.preventDefault();
						store.links.toggleDeleted(link.id);
					}}
				>
					<Trash2 class="h-4 w-4" />
				</Button>
			</div>
		</div>
	</div>
</div>