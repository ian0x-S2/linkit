<script lang="ts">
	import { aiConfig, updateAIConfig } from '$lib/store.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Badge } from '$lib/components/ui/badge';
	import { ArrowLeft, Sparkles, Shield, Cpu } from '@lucide/svelte';

	let config = $state({ ...aiConfig });

	function save() {
		updateAIConfig(config);
	}
</script>

<div class="flex h-14 items-center border-b bg-background/80 px-4 backdrop-blur-md">
	<Button variant="ghost" size="icon" href="/" class="mr-2 h-8 w-8 rounded-full">
		<ArrowLeft class="h-4 w-4" />
	</Button>
	<h1 class="text-xl font-bold tracking-tight">Settings</h1>
</div>

<div class="mx-auto max-w-2xl p-4 space-y-8">
	<!-- Section: AI Features -->
	<section class="space-y-4">
		<div class="px-1">
			<div class="flex items-center gap-2 mb-1">
				<Sparkles class="h-4 w-4 text-primary" />
				<h2 class="text-lg font-bold tracking-tight">Intelligence</h2>
			</div>
			<p class="text-sm text-muted-foreground">
				Opt-in AI features for smart tagging and summarization.
			</p>
		</div>

		<Card class="border-none bg-background shadow-none">
			<CardContent class="p-0 space-y-6">
				<div class="flex items-start justify-between rounded-xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
					<div class="space-y-1">
						<Label for="ai-enabled" class="text-base font-bold cursor-pointer">Enable AI Engine</Label>
						<p class="text-xs text-muted-foreground leading-relaxed max-w-[400px]">
							Requires an OpenAI-compatible API key. Your data never leaves your device except for the requests sent to your chosen provider.
						</p>
					</div>
					<Checkbox
						id="ai-enabled"
						bind:checked={config.enabled}
						class="mt-1"
					/>
				</div>

				{#if config.enabled}
					<div class="space-y-6 rounded-xl border p-6 bg-background animate-in fade-in slide-in-from-top-2 duration-300">
						<div class="grid gap-6">
							<div class="space-y-2">
								<div class="flex items-center gap-2">
									<Cpu class="h-3.5 w-3.5 text-muted-foreground" />
									<Label for="base-url" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Provider API URL</Label>
								</div>
								<Input
									id="base-url"
									placeholder="https://api.openai.com/v1"
									bind:value={config.baseUrl}
									class="bg-muted/30 border-none focus-visible:ring-1"
								/>
							</div>

							<div class="space-y-2">
								<div class="flex items-center gap-2">
									<Shield class="h-3.5 w-3.5 text-muted-foreground" />
									<Label for="api-key" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">API Key</Label>
								</div>
								<Input
									id="api-key"
									type="password"
									placeholder="sk-..."
									bind:value={config.apiKey}
									class="bg-muted/30 border-none focus-visible:ring-1"
								/>
							</div>

							<div class="space-y-2">
								<div class="flex items-center gap-2">
									<div class="h-3.5 w-3.5 flex items-center justify-center">
										<span class="text-[10px] font-bold">M</span>
									</div>
									<Label for="model" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Model Name</Label>
								</div>
								<Input 
									id="model" 
									placeholder="gpt-4o-mini" 
									bind:value={config.model} 
									class="bg-muted/30 border-none focus-visible:ring-1"
								/>
							</div>
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>
	</section>

	<Separator class="opacity-50" />

	<!-- Section: About / Info -->
	<section class="px-1 space-y-4">
		<h3 class="text-sm font-bold uppercase tracking-widest text-muted-foreground">System</h3>
		<div class="flex items-center justify-between py-2">
			<div>
				<p class="font-medium">Data Storage</p>
				<p class="text-xs text-muted-foreground">Local (Browser Storage)</p>
			</div>
			<Badge variant="outline" class="text-[10px] uppercase font-bold tracking-tighter">Healthy</Badge>
		</div>
	</section>

	<!-- Footer Actions -->
	<div class="pt-6 flex justify-end gap-3">
		<Button variant="ghost" href="/" class="rounded-full px-6">Cancel</Button>
		<Button onclick={save} class="rounded-full px-8 shadow-md">
			Save Changes
		</Button>
	</div>
</div>