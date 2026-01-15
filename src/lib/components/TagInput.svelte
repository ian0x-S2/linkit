<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { X, Plus, Tag as TagIcon, Check } from '@lucide/svelte';
	import { allTags } from '$lib/store.svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { tick } from 'svelte';

	interface Props {
		selected: string[];
		onchange: (tags: string[]) => void;
	}

	let { selected = [], onchange }: Props = $props();
	let open = $state(false);
	let value = $state(''); // Used for the search input in Command
	let triggerRef = $state<HTMLButtonElement>(null!);

	const availableTags = $derived(allTags.all.filter((t: string) => !selected.includes(t)));

	const showCreateOption = $derived(
		value.trim() !== '' &&
			!allTags.all.some((t: string) => t.toLowerCase() === value.trim().toLowerCase()) &&
			!selected.some((t: string) => t.toLowerCase() === value.trim().toLowerCase())
	);

	function addTag(tag: string) {
		const trimmed = tag.trim();
		if (trimmed && !selected.includes(trimmed)) {
			onchange([...selected, trimmed]);
		}
		value = '';
	}

	function removeTag(tag: string) {
		onchange(selected.filter((t) => t !== tag));
	}

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef?.focus();
		});
	}
</script>

<div class="flex w-full flex-col gap-3">
	<!-- Selected Tags Display (Linear Style) -->
	{#if selected.length > 0}
		<div class="flex flex-wrap gap-1.5">
			{#each selected as tag (tag)}
				<Badge
					variant="secondary"
					class="h-6 gap-1 rounded-[4px] border-primary/20 bg-primary/10 px-1.5 py-0 text-[11px] text-primary transition-colors hover:bg-primary/20"
				>
					{tag}
					<button
						type="button"
						class="ml-0.5 transition-colors outline-none hover:text-destructive"
						onclick={(e) => {
							e.stopPropagation();
							removeTag(tag);
						}}
						aria-label="Remove {tag}"
					>
						<X class="h-2.5 w-2.5" />
					</button>
				</Badge>
			{/each}
		</div>
	{/if}

	<Popover.Root bind:open>
		<Popover.Trigger
			bind:ref={triggerRef}
			class={cn(
				buttonVariants({ variant: 'outline' }),
				'h-10 w-full justify-between border-muted-foreground/10 bg-muted/20 text-[13px] font-normal text-muted-foreground transition-all duration-200 hover:bg-muted/30'
			)}
			role="combobox"
			aria-expanded={open}
		>
			<div class="flex items-center gap-2">
				<TagIcon class="h-3.5 w-3.5 opacity-50" />
				<span>{selected.length > 0 ? 'Add more tags...' : 'Add tags...'}</span>
			</div>
			<Plus
				class={cn('h-3.5 w-3.5 opacity-50 transition-transform duration-200', open && 'rotate-45')}
			/>
		</Popover.Trigger>

		<Popover.Content
			class="w-[var(--bits-popover-anchor-width)] rounded-md border-muted-foreground/10 bg-popover p-1 shadow-xl"
			align="start"
			sideOffset={6}
		>
			<Command.Root>
				<Command.Input
					placeholder="Search or create tags..."
					bind:value
					class="h-8 border-none text-[13px] focus:ring-0"
				/>
				<Command.Separator class="my-1 bg-muted-foreground/5" />
				<Command.List class="max-h-[220px] overflow-y-auto">
					{#if value.trim() && !allTags.all.some((t: string) => t.toLowerCase() === value
									.trim()
									.toLowerCase()) && !selected.some((t: string) => t.toLowerCase() === value
									.trim()
									.toLowerCase())}
						<Command.Empty>
							<button
								class="group flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-primary/10 hover:text-primary"
								onclick={() => {
									addTag(value);
									closeAndFocusTrigger();
								}}
							>
								<Plus class="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
								<span>Create "<span class="font-medium">{value}</span>"</span>
							</button>
						</Command.Empty>
					{:else}
						<Command.Empty>
							<p class="py-6 text-center text-[12px] text-muted-foreground/60">
								{#if value.trim() && selected.some((t: string) => t.toLowerCase() === value
												.trim()
												.toLowerCase())}
									Tag already selected
								{:else}
									No results found
								{/if}
							</p>
						</Command.Empty>
					{/if}

					{#if showCreateOption}
						<Command.Group
							heading="Actions"
							class="px-1.5 py-1 text-[11px] font-bold tracking-wider text-muted-foreground/50 uppercase"
						>
							<Command.Item
								{value}
								onSelect={() => {
									addTag(value);
									closeAndFocusTrigger();
								}}
								class="group cursor-pointer rounded-[4px] px-2 py-1.5 text-[13px] text-primary hover:bg-primary/5"
							>
								<div class="flex items-center gap-2">
									<Plus class="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
									<span>Create "<span class="font-medium">{value}</span>"</span>
								</div>
							</Command.Item>
						</Command.Group>
					{/if}

					{#if availableTags.length > 0}
						<Command.Group
							heading="Existing tags"
							class="px-1.5 py-1 text-[11px] font-bold tracking-wider text-muted-foreground/50 uppercase"
						>
							{#each availableTags as tag (tag)}
								<Command.Item
									value={tag}
									onSelect={() => {
										addTag(tag);
										closeAndFocusTrigger();
									}}
									class="cursor-pointer rounded-[4px] px-2 py-1.5 text-[13px] transition-colors hover:bg-muted/50"
								>
									<div class="flex w-full items-center justify-between">
										<div class="flex items-center gap-2">
											<TagIcon class="h-3.5 w-3.5 opacity-40" />
											{tag}
										</div>
										{#if selected.includes(tag)}
											<Check class="h-3.5 w-3.5 text-primary" />
										{/if}
									</div>
								</Command.Item>
							{/each}
						</Command.Group>
					{/if}
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
