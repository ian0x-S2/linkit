<script lang="ts">
	import { linkStore, updateAIConfig } from '$lib/store.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Badge } from '$lib/components/ui/badge';
	import { ArrowLeft, Sparkles, Shield, Cpu } from '@lucide/svelte';

	// We use a local state for the form, initialized with current config
	// Since aiConfig in store is a Rune-based object, we spread its current values
	let config = $state({
		enabled: linkStore.aiConfig.enabled,
		baseUrl: linkStore.aiConfig.baseUrl,
		apiKey: linkStore.aiConfig.apiKey,
		model: linkStore.aiConfig.model
	});

	function save() {
		updateAIConfig(config);
	}
</script>

<!-- Header Section: Fixed h-12 to match Sidebar/Workspace Header -->
<div class="flex h-12 items-center border-b bg-background/80 px-4 backdrop-blur-md">
	<Button variant="ghost" size="icon" href="/" class="mr-2 h-7 w-7 rounded-md">
		<ArrowLeft class="h-3.5 w-3.5" />
	</Button>
	<h1 class="text-[13px] font-semibold tracking-tight">Settings</h1>
</div>

<div class="mx-auto max-w-2xl space-y-6 p-6">
	<!-- Section: AI Features -->
	<section class="space-y-4">
		<div class="px-1">
			<div class="mb-1 flex items-center gap-2">
				<Sparkles class="h-3.5 w-3.5 text-primary" />
				<h2 class="text-sm font-semibold tracking-tight">Intelligence</h2>
			</div>
			<p class="text-[12.5px] text-muted-foreground">
				Opt-in AI features for smart tagging and summarization.
			</p>
		</div>

		<div class="space-y-4">
			<div
				class="flex items-start justify-between rounded-md border bg-muted/20 p-4 transition-colors hover:bg-muted/30"
			>
				<div class="space-y-1">
					<Label for="ai-enabled" class="cursor-pointer text-[13px] font-semibold"
						>Enable AI Engine</Label
					>
					<p class="max-w-[400px] text-[11.5px] leading-relaxed text-muted-foreground/70">
						Requires an OpenAI-compatible API key. Your data never leaves your device except for the
						requests sent to your chosen provider.
					</p>
				</div>
				<Checkbox id="ai-enabled" bind:checked={config.enabled} class="mt-1" />
			</div>

			{#if config.enabled}
				<div
					class="space-y-5 rounded-md border bg-background p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] duration-300 animate-in fade-in slide-in-from-top-2"
				>
					<div class="grid gap-4">
						<div class="space-y-1.5">
							<div class="flex items-center gap-2 px-0.5">
								<Cpu class="h-3 w-3 text-muted-foreground/60" />
								<Label
									for="base-url"
									class="text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase"
									>Provider API URL</Label
								>
							</div>
							<Input
								id="base-url"
								placeholder="https://api.openai.com/v1"
								bind:value={config.baseUrl}
								class="h-8 border-muted bg-muted/10 text-[12.5px] focus-visible:ring-1"
							/>
						</div>

						<div class="space-y-1.5">
							<div class="flex items-center gap-2 px-0.5">
								<Shield class="h-3 w-3 text-muted-foreground/60" />
								<Label
									for="api-key"
									class="text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase"
									>API Key</Label
								>
							</div>
							<Input
								id="api-key"
								type="password"
								placeholder="sk-..."
								bind:value={config.apiKey}
								class="h-8 border-muted bg-muted/10 text-[12.5px] focus-visible:ring-1"
							/>
						</div>

						<div class="space-y-1.5">
							<div class="flex items-center gap-2 px-0.5">
								<div class="flex h-3 w-3 items-center justify-center">
									<span class="text-[9px] font-bold text-muted-foreground/60">M</span>
								</div>
								<Label
									for="model"
									class="text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase"
									>Model Name</Label
								>
							</div>
							<Input
								id="model"
								placeholder="gpt-4o-mini"
								bind:value={config.model}
								class="h-8 border-muted bg-muted/10 text-[12.5px] focus-visible:ring-1"
							/>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</section>

	<Separator class="opacity-40" />

	<!-- Section: About / Info -->
	<section class="space-y-3 px-1">
		<h3 class="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">System</h3>
		<div class="flex items-center justify-between py-1">
			<div class="space-y-0.5">
				<p class="text-[12.5px] font-medium">Data Storage</p>
				<p class="text-[11px] text-muted-foreground/60">Local (Browser Storage)</p>
			</div>
			<Badge
				variant="outline"
				class="h-4.5 rounded-[4px] px-1.5 text-[9px] font-bold tracking-tighter uppercase"
				>Healthy</Badge
			>
		</div>
	</section>

	<!-- Footer Actions -->
	<div class="flex justify-end gap-2 pt-6">
		<Button variant="ghost" href="/" class="h-8 rounded-md px-4 text-[12.5px]">Cancel</Button>
		<Button onclick={save} class="h-8 rounded-md px-6 text-[12.5px] shadow-sm">Save Changes</Button>
	</div>
</div>
