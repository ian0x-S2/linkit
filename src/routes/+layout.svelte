<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$lib/components/AppSidebar.svelte";

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let open = $state(true);
</script>

<ModeWatcher />

<Sidebar.Provider bind:open>
	<div class="flex h-screen w-full overflow-hidden bg-background">
		<AppSidebar />
		<main class="flex-1 min-w-0 flex flex-col overflow-hidden">
			{@render children?.()}
		</main>
	</div>
</Sidebar.Provider>