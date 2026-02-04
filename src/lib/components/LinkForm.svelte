<script lang="ts">
	import type { Link } from '$lib/types';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import TagInput from '$lib/components/TagInput.svelte';
	import { X, Globe, Tag, Type, Loader, TextAlignStart } from '@lucide/svelte';
	import { browser } from '$app/environment';

	interface Props {
		link?: Link | null;
		previewData?: {
			url: string;
			title: string | null;
			description: string | null;
			image: string | null;
		} | null;
		onsave: () => void;
		oncancel: () => void;
	}

	let { link = null, previewData = null, onsave, oncancel }: Props = $props();

	const store = getContext<AppStore>('store');

	let url = $state('');
	let title = $state('');
	let description = $state('');
	let tags = $state<string[]>([]);
	let image = $state('');
	let isSaving = $state(false);
	let isLoadingPreview = $state(false);

	$effect(() => {
		if (link) {
			url = link.url || '';
			title = link.title || '';
			description = link.description || '';
			tags = [...link.tags];
			image = link.image || '';
		} else if (previewData) {
			// New link with preview data
			url = previewData.url || '';
			title = previewData.title || '';
			description = previewData.description || '';
			image = previewData.image || '';
			tags = [];
		} else {
			url = '';
			title = '';
			description = '';
			tags = [];
			image = '';
		}
	});

	async function fetchOpenGraphPreview() {
		if (!browser || !url) return;
		isLoadingPreview = true;
		try {
			const response = await fetch('/api/opengraph', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});

			if (response.ok) {
				const data = await response.json();
				if (data.title && !title) title = data.title;
				if (data.description && !description) description = data.description;
				if (data.image && !image) image = data.image;
			}
		} catch {
			// Ignore
		} finally {
			isLoadingPreview = false;
		}
	}

	async function handleSubmit() {
		if (!url.trim()) return;
		isSaving = true;
		try {
			const linkData = {
				url: url.trim(),
				title: title.trim() || null,
				description: description.trim() || null,
				image: image.trim() || null,
				tags: tags,
				workspaceId: store.workspaces.activeId
			};

			if (link?.id) {
				await store.links.update(link.id, linkData);
			} else {
				await store.links.add(linkData);
			}
			onsave();
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="flex h-full flex-col bg-background text-foreground">
	<!-- Header -->
	<div class="flex items-center justify-between px-4 py-2 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border/40">
		<div class="flex items-center gap-3">
			<Button
				variant="ghost"
				size="icon"
				onclick={oncancel}
				class="h-8 w-8 rounded-md"
			>
				<X class="h-4 w-4" />
			</Button>
			<h2 class="text-[14px] font-bold tracking-tight">
				{link ? 'Edit link' : 'New link'}
			</h2>
		</div>
		<Button
			onclick={handleSubmit}
			disabled={isSaving || !url.trim()}
			class="rounded-md px-4 h-8 text-[12px] font-bold shadow-sm"
		>
			{#if isSaving}
				<Loader class="mr-1.5 h-3.5 w-3.5 animate-spin" />
			{/if}
			Save
		</Button>
	</div>

	<!-- Body -->
	<div class="max-h-[80vh] space-y-4 overflow-y-auto px-5 py-5">
		<!-- URL Field -->
		<div class="space-y-1.5">
			<div class="flex items-center gap-2 px-0.5">
				<Globe class="h-3.5 w-3.5 text-primary" />
				<Label for="url" class="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Link URL</Label>
			</div>
			<div class="flex gap-2">
				<Input
					id="url"
					bind:value={url}
					placeholder="https://example.com"
					class="h-9 rounded-md border-border bg-muted/20 text-[13px] focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-all"
				/>
				<Button
					variant="secondary"
					onclick={fetchOpenGraphPreview}
					disabled={!url || isLoadingPreview}
					class="h-9 rounded-md px-3 text-[12px] font-bold"
				>
					{#if isLoadingPreview}
						<Loader class="mr-1.5 h-3.5 w-3.5 animate-spin" />
					{/if}
					Fetch
				</Button>
			</div>
		</div>

		<!-- Title Field -->
		<div class="space-y-1.5">
			<div class="flex items-center gap-2 px-0.5">
				<Type class="h-3.5 w-3.5 text-primary" />
				<Label for="title" class="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Title</Label>
			</div>
			<Input
				id="title"
				bind:value={title}
				placeholder="Give it a name..."
				class="h-9 rounded-md border-border bg-muted/20 text-[13px] focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-all"
			/>
		</div>

		<!-- Tags Field -->
		<div class="space-y-1.5">
			<div class="flex items-center gap-2 px-0.5">
				<Tag class="h-3.5 w-3.5 text-primary" />
				<Label for="tags" class="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Tags</Label>
			</div>
			<TagInput selected={tags} onchange={(newTags) => (tags = newTags)} />
		</div>

		<!-- Description -->
		<div class="space-y-1.5">
			<div class="flex items-center gap-2 px-0.5">
				<TextAlignStart class="h-3.5 w-3.5 text-primary" />
				<Label for="description" class="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Notes</Label>
			</div>
			<Textarea
				id="description"
				bind:value={description}
				placeholder="What makes this link interesting?"
				rows={3}
				class="resize-none rounded-md border-border bg-muted/20 py-2.5 focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-all text-[13px] leading-snug"
			/>
		</div>

		{#if image}
			<div class="pt-1 duration-300 animate-in fade-in slide-in-from-top-2">
				<div
					class="relative aspect-[2/1] overflow-hidden rounded-md border border-border shadow-sm"
				>
					<img src={image} alt="Preview" class="h-full w-full object-cover" />
					<Button
						variant="secondary"
						size="icon"
						class="absolute top-1.5 right-1.5 h-7 w-7 rounded-md bg-background/80 shadow-md backdrop-blur-md hover:bg-background"
						onclick={() => (image = '')}
					>
						<X class="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
