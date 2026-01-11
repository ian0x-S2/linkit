<script lang="ts">
	import type { Link } from '$lib/types';
	import { deleteLink, getFilteredLinks, search } from '$lib/store.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	import LinkForm from '$lib/components/LinkForm.svelte';
	import FeedHeader from '$lib/components/FeedHeader.svelte';
	import LinkComposer from '$lib/components/LinkComposer.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';

	let showForm = $state(false);
	let editingLink = $state<Link | null>(null);
	let showExportDialog = $state(false);
	let filteredLinksList = $state<Link[]>([]);

	$effect(() => {
		// filteredLinksList will react to search.query changes automatically
		filteredLinksList = getFilteredLinks();
	});

	function handleEdit(link: Link) {
		editingLink = link;
		showForm = true;
	}

	function handleClose() {
		showForm = false;
		editingLink = null;
	}
</script>

<div>
	<div class="mx-auto min-h-screen max-w-2xl border-x bg-background">
		<FeedHeader onExport={() => (showExportDialog = true)} />

		<LinkComposer />

		<LinkForm link={editingLink ?? undefined} bind:open={showForm} onclose={handleClose} />

		<ExportDialog bind:open={showExportDialog} links={filteredLinksList} />

		<div class="divide-y">
			{#each filteredLinksList as link (link.id)}
				<LinkCard {link} onedit={handleEdit} ondelete={deleteLink} />
			{:else}
				<EmptyState />
			{/each}
		</div>
	</div>
</div>
