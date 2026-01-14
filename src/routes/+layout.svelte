<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import {
		Sidebar,
		SidebarContent,
		SidebarGroup,
		SidebarGroupContent,
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem,
		SidebarProvider,
		SidebarTrigger,
		SidebarFooter,
		SidebarGroupLabel,
		SidebarSeparator
	} from '$lib/components/ui/sidebar';
	import { Button } from '$lib/components/ui/button';
	import { 
		Inbox, 
		Library, 
		Hash, 
		Sparkles, 
		Settings, 
		Moon, 
		Sun, 
		Link as LinkIcon,
		Archive,
		Star
	} from '@lucide/svelte';
	import { toggleMode } from 'mode-watcher';
	import { page } from '$app/state';
	import { getAllTags, selectedTags, toggleSelectedTag } from '$lib/store.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let open = $state(true);

	const navigation = [
		{
			label: 'Inbox',
			href: '/',
			icon: Inbox
		},
		{
			label: 'All Links',
			href: '/library',
			icon: Library
		},
		{
			label: 'Favorites',
			href: '/favorites',
			icon: Star
		},
		{
			label: 'Archive',
			href: '/archive',
			icon: Archive
		}
	];

	const secondaryNav = [
		{
			label: 'AI Suggestions',
			href: '/suggestions',
			icon: Sparkles
		}
	];
</script>

<ModeWatcher />
<SidebarProvider bind:open class="min-h-screen bg-background">
	<div class="flex w-full overflow-hidden">
		<!-- Main Navigation Sidebar -->
		<Sidebar collapsible="none" class="w-64 border-r bg-muted/10">
			<SidebarContent>
				<SidebarGroup>
					<div class="flex h-14 items-center gap-3 px-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
						>
							<LinkIcon class="h-5 w-5" />
						</div>
						<span class="text-sm font-semibold tracking-tight">My Library</span>
					</div>

					<SidebarGroupContent class="px-2">
						<SidebarMenu>
							{#each navigation as item (item.href)}
								<SidebarMenuItem>
									<SidebarMenuButton
										href={item.href}
										isActive={page.url.pathname === item.href}
										tooltip={item.label}
										class="rounded-md transition-all hover:bg-accent data-[active=true]:bg-accent data-[active=true]:font-medium"
									>
										<item.icon class="h-4 w-4" />
										<span>{item.label}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							{/each}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator />

				<SidebarGroup>
					<SidebarGroupLabel>Organization</SidebarGroupLabel>
					<SidebarGroupContent class="px-2">
						<SidebarMenu>
							{#each secondaryNav as item (item.href)}
								<SidebarMenuItem>
									<SidebarMenuButton
										href={item.href}
										isActive={page.url.pathname === item.href}
										class="rounded-md transition-all hover:bg-accent"
									>
										<item.icon class="h-4 w-4" />
										<span>{item.label}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							{/each}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup class="mt-auto">
					<SidebarGroupLabel>Tags</SidebarGroupLabel>
					<SidebarGroupContent class="px-2">
						<div class="flex flex-wrap gap-1 px-2 py-1">
							{#each getAllTags().slice(0, 12) as tag (tag)}
								<button
									onclick={() => toggleSelectedTag(tag)}
									class="flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors {selectedTags.includes(
										tag
									)
										? 'bg-primary text-primary-foreground'
										: 'bg-muted/50 text-muted-foreground hover:bg-muted'}"
								>
									<Hash class="h-3 w-3" />
									{tag}
								</button>
							{/each}
						</div>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter class="border-t bg-muted/5 p-4">
				<div class="flex items-center justify-between">
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 text-muted-foreground hover:text-foreground"
						onclick={toggleMode}
					>
						<Moon class="h-4 w-4 dark:hidden" />
						<Sun class="hidden h-4 w-4 dark:block" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						href="/settings"
						class="h-8 w-8 text-muted-foreground hover:text-foreground {page.url.pathname === '/settings' ? 'bg-accent' : ''}"
					>
						<Settings class="h-4 w-4" />
					</Button>
				</div>
			</SidebarFooter>
		</Sidebar>

		<!-- Main Workspace Area -->
		<main class="flex-1 overflow-y-auto bg-background">
			<div class="flex h-full flex-col">
				{@render children?.()}
			</div>
		</main>
	</div>
</SidebarProvider>

