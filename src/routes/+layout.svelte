<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$lib/components/AppSidebar.svelte";
	import { setContext } from 'svelte';
	import { LinkStore } from '$lib/store.svelte';

	interface Props {
		children?: import('svelte').Snippet;
		data: any;
	}

	let { children, data }: Props = $props();

	// Create the store as early as possible
	// Using context prevents shared state between users on the server (if it were not local-only)
	// and ensures a clean hydration on the client.
	const store = new LinkStore(data);
	setContext('store', store);

	$effect(() => {
		store.maybeMigrate();
	});

	let open = $state(true);
</script>

<ModeWatcher />

<Sidebar.Provider bind:open>
	<div class="flex h-screen w-full overflow-hidden bg-background">
		<AppSidebar />
		
		<main class="flex-1 min-w-0 flex flex-col h-screen overflow-hidden relative">
			{@render children?.()}
		</main>
	</div>
</Sidebar.Provider>
