<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { 
		Inbox, 
		Library, 
		Sparkles, 
		Settings, 
		Link as LinkIcon,
		Archive,
		Star,
		Search,
		Plus,
		ChevronDown,
		Moon,
		Sun
	} from '@lucide/svelte';
	import { page } from '$app/state';
	import { toggleMode } from 'mode-watcher';

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
		},
		{
			label: 'Settings',
			href: '/settings',
			icon: Settings
		}
	];
</script>

<Sidebar.Root collapsible="icon" class="border-r">
	<Sidebar.Header class="h-14 border-b p-0 flex items-center justify-center">
		<div class="flex items-center gap-3 w-full px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
			<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
				<LinkIcon class="h-5 w-5" />
			</div>
			<div class="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
				<span class="truncate font-bold">Workspace</span>
				<span class="truncate text-xs text-muted-foreground">Personal Library</span>
			</div>
		</div>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel class="group-data-[collapsible=icon]:hidden">Application</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each navigation as item (item.href)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								tooltip={item.label}
								isActive={page.url.pathname === item.href}
							>
								{#snippet child({ props })}
									<a href={item.href} {...props}>
										<item.icon class="h-4 w-4" />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<Sidebar.Separator />

		<Sidebar.Group>
			<Sidebar.GroupLabel class="group-data-[collapsible=icon]:hidden">Organization</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each secondaryNav as item (item.href)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								tooltip={item.label}
								isActive={page.url.pathname === item.href}
							>
								{#snippet child({ props })}
									<a href={item.href} {...props}>
										<item.icon class="h-4 w-4" />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer class="p-2 border-t">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton 
					tooltip="Toggle Theme" 
					onclick={toggleMode}
					class="group-data-[collapsible=icon]:justify-center"
				>
					<div class="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
						<div class="relative flex h-4 w-4 shrink-0 items-center justify-center">
							<Sun class="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<Moon class="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						</div>
						<span class="truncate group-data-[collapsible=icon]:hidden">Appearance</span>
					</div>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>

			<Sidebar.MenuItem>
				<Sidebar.MenuButton 
					tooltip="Settings" 
					isActive={page.url.pathname === '/settings'}
					class="group-data-[collapsible=icon]:justify-center"
				>
					{#snippet child({ props })}
						<a href="/settings" {...props}>
							<Settings class="h-4 w-4 shrink-0" />
							<span class="truncate group-data-[collapsible=icon]:hidden">Settings</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
