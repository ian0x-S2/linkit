<script lang="ts">
	import type { Link } from '$lib/types';
	import { addLink, getAllTags } from '$lib/store.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Loader2, X, Plus, Hash } from '@lucide/svelte';

	let newLinkUrl = $state('');
	let isFetchingOg = $state(false);
	let ogPreview = $state<Partial<Link> | null>(null);
	let tagInput = $state('');
	let tagPopoverOpen = $state(false);

	// URL detection and metadata fetch
	$effect(() => {
		const urlPattern =
			/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
		const match = newLinkUrl.match(urlPattern);

		if (match && match[0] && (!ogPreview || ogPreview.url !== match[0])) {
			handleUrlPaste(match[0]);
		}
	});

	async function handleUrlPaste(url: string) {
		isFetchingOg = true;
		try {
			const response = await fetch('/api/opengraph', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});
			if (response.ok) {
				const data = await response.json();
				ogPreview = {
					url,
					title: data.title || '',
					description: data.description || '',
					image: data.image || '',
					tags: [],
					createdAt: Date.now()
				};
			}
		} catch (err) {
			console.error('Failed to fetch OG data', err);
		} finally {
			isFetchingOg = false;
		}
	}

	function clearPreview() {
		newLinkUrl = '';
		ogPreview = null;
		isFetchingOg = false;
		tagInput = '';
	}

	function handleQuickPost() {
		if (ogPreview && ogPreview.url) {
			addLink({
				url: ogPreview.url,
				title: ogPreview.title || '',
				description: ogPreview.description || '',
				image: ogPreview.image || '',
				tags: ogPreview.tags || [],
				createdAt: Date.now()
			});
			clearPreview();
		}
	}

	function addTagToPreview(tag: string) {
		const cleanTag = tag.trim().toLowerCase();
		if (cleanTag && ogPreview) {
			if (!ogPreview.tags) ogPreview.tags = [];
			if (!ogPreview.tags.includes(cleanTag)) {
				ogPreview.tags = [...ogPreview.tags, cleanTag];
			}
			tagInput = '';
			tagPopoverOpen = false;
		}
	}

	function removeTagFromPreview(tagToRemove: string) {
		if (ogPreview && ogPreview.tags) {
			ogPreview.tags = ogPreview.tags.filter((t) => t !== tagToRemove);
		}
	}

	let tagSuggestions = $derived(getAllTags().filter((t) => !ogPreview?.tags?.includes(t)));
</script>

<div class="border-b p-4 pb-4">
	<div class="flex items-center gap-2">
		<div class="flex-1">
			<Input
				bind:value={newLinkUrl}
				placeholder="Paste a link here..."
				class="h-10 rounded-md  px-4 py-2 text-lg shadow-none focus-visible:ring-0"
			/>
		</div>
		<Button
			size="default"
			onclick={handleQuickPost}
			disabled={!ogPreview}
			class="  h-9 w-24 rounded-md  "
		>
			Post
		</Button>
	</div>

	{#if isFetchingOg}
		<div class="flex items-center gap-2 px-1 py-4 text-sm text-muted-foreground">
			<Loader2 class="h-4 w-4 animate-spin" />
			<span>Fetching link metadata...</span>
		</div>
	{:else if ogPreview}
		<div class="group relative mt-4">
			<button
				onclick={clearPreview}
				class="absolute -top-2 -right-2 z-10 rounded-full border bg-background p-1 shadow-sm transition-colors hover:bg-muted"
			>
				<X class="h-4 w-4" />
			</button>
			<div class="relative rounded-xl border bg-card shadow-sm">
				<div class="flex h-32 overflow-hidden rounded-t-xl">
					{#if ogPreview.image}
						<img
							src={ogPreview.image}
							alt={ogPreview.title}
							class="h-full w-40 border-r object-cover"
						/>
					{/if}
					<div class="flex flex-1 flex-col justify-center p-4">
						<h3 class="line-clamp-2 text-base leading-tight font-bold">{ogPreview.title}</h3>
						<p class="mt-1 line-clamp-2 text-sm text-muted-foreground">
							{ogPreview.description}
						</p>
						<p class="mt-2 truncate text-xs text-primary/60">{ogPreview.url}</p>
					</div>
				</div>

				<!-- Tags Section in Preview -->
				<div class="overflow-visible rounded-b-xl border-t bg-muted/20 p-3">
					<div class="flex flex-wrap items-center gap-2">
						{#each ogPreview.tags || [] as tag}
							<Badge variant="secondary" class="h-6 gap-1 rounded-md px-2 text-xs">
								#{tag}
								<button onclick={() => removeTagFromPreview(tag)} class="hover:text-destructive">
									<X class="h-3 w-3" />
								</button>
							</Badge>
						{/each}

						<Popover.Root bind:open={tagPopoverOpen}>
							<Popover.Trigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="outline"
										size="sm"
										class="h-6 gap-1 border-dashed border-muted-foreground/30 px-2 text-[10px] hover:border-primary/50"
									>
										<Plus class="h-3 w-3" />
										Tag
									</Button>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content class="w-[200px] p-0" align="start" side="bottom">
								<Command.Root>
									<Command.Input
										placeholder="Search tags..."
										bind:value={tagInput}
										onkeydown={(e) => {
											if (e.key === 'Enter' && tagInput.trim()) {
												e.preventDefault();
												addTagToPreview(tagInput);
											}
										}}
									/>
									<Command.List>
										<Command.Empty class="p-0">
											<Button
												variant="ghost"
												class="h-8 w-full justify-start gap-2 rounded-none px-2 text-[11px] hover:bg-accent"
												onclick={() => addTagToPreview(tagInput)}
											>
												<Plus class="size-3 text-primary" />
												<span>Create <span class="font-bold">"{tagInput}"</span></span>
											</Button>
										</Command.Empty>
										<Command.Group>
											{#each tagSuggestions as tag}
												<Command.Item
													value={tag}
													onSelect={() => addTagToPreview(tag)}
													class="text-xs"
												>
													<Hash class="mr-2 size-3 opacity-50" />
													{tag}
												</Command.Item>
											{/each}
										</Command.Group>
									</Command.List>
								</Command.Root>
							</Popover.Content>
						</Popover.Root>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
