import type { Link, Workspace, LinkId, WorkspaceId, Result, ApiError } from './types';
import { browser } from '$app/environment';
import { SvelteSet, SvelteURLSearchParams } from 'svelte/reactivity';
import { STORAGE_KEYS, API_ENDPOINTS, CATEGORIES, type Category, APP_CONFIG } from './constants';

/**
 * Interface for a structured logger.
 * Allows injecting different logging implementations (e.g., Sentry, Console).
 */
export interface Logger {
	error(message: string, context?: unknown): void;
	info(message: string, context?: unknown): void;
	warn(message: string, context?: unknown): void;
}

const defaultLogger: Logger = {
	error: (msg, ctx) => console.error(`[Store Error] ${msg}`, ctx),
	info: (msg, ctx) => console.info(`[Store Info] ${msg}`, ctx),
	warn: (msg, ctx) => console.warn(`[Store Warn] ${msg}`, ctx),
};

/**
 * Pure functions for link filtering and tag extraction.
 * Separated for testability and to keep the store focused on state management.
 */
export class FilterService {
	/**
	 * Filters links based on category, search query, and selected tags.
	 */
	static filter(
		links: Link[],
		category: Category,
		searchQuery: string,
		selectedTags: string[]
	): Link[] {
		let result = [...links];

		// Category filtering
		switch (category) {
			case CATEGORIES.INBOX:
				result = result.filter(l => !l.isArchived && !l.isDeleted);
				break;
			case CATEGORIES.FAVORITES:
				result = result.filter(l => l.isFavorite && !l.isDeleted);
				break;
			case CATEGORIES.ARCHIVE:
				result = result.filter(l => l.isArchived && !l.isDeleted);
				break;
			case CATEGORIES.TRASH:
				result = result.filter(l => l.isDeleted);
				break;
		}

		// Search query filtering
		const query = searchQuery.trim().toLowerCase();
		if (query) {
			result = result.filter((link) => {
				const titleMatch = link.title?.toLowerCase().includes(query) ?? false;
				const urlMatch = link.url.toLowerCase().includes(query);
				const descMatch = link.description?.toLowerCase().includes(query) ?? false;
				const tagMatch = link.tags.some((tag) => tag.toLowerCase().includes(query));
				return titleMatch || urlMatch || descMatch || tagMatch;
			});
		}

		// Tag filtering
		if (selectedTags.length > 0) {
			result = result.filter((link) =>
				selectedTags.every((tag) => link.tags.includes(tag))
			);
		}

		return result.sort((a, b) => b.createdAt - a.createdAt);
	}

	/**
	 * Extracts and sorts all unique tags from a list of links.
	 */
	static extractUniqueTags(links: Link[]): string[] {
		const tagSet = new SvelteSet<string>();
		for (const link of links) {
			for (const tag of link.tags) {
				tagSet.add(tag);
			}
		}
		return Array.from(tagSet).sort();
	}
}

/**
 * Data access layer for Links and Workspaces.
 * Handles API communication, retries, and error mapping.
 */
export class Repository {
	constructor(private logger: Logger = defaultLogger) { }

	private async request<T>(
		url: string,
		options?: RequestInit,
		retries = APP_CONFIG.RETRY_ATTEMPTS
	): Promise<Result<T, ApiError>> {
		try {
			const response = await fetch(url, options);
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				return {
					ok: false,
					error: {
						message: errorData.error || response.statusText,
						status: response.status
					}
				};
			}
			const value = await response.json();
			return { ok: true, value };
		} catch (err) {
			if (retries > 0) {
				await new Promise(r => setTimeout(r, APP_CONFIG.RETRY_DELAY_MS));
				return this.request(url, options, retries - 1);
			}
			this.logger.error(`API Request failed: ${url}`, err);
			return {
				ok: false,
				error: { message: err instanceof Error ? err.message : 'Network error' }
			};
		}
	}

	async fetchLinks(workspaceId: WorkspaceId): Promise<Result<Link[], ApiError>> {
		const params = new SvelteURLSearchParams({ workspaceId, all: 'true' });
		return this.request<Link[]>(`${API_ENDPOINTS.LINKS}?${params}`);
	}

	async createLink(linkData: Partial<Link>): Promise<Result<Link, ApiError>> {
		return this.request<Link>(API_ENDPOINTS.LINKS, {
			method: 'POST',
			body: JSON.stringify(linkData)
		});
	}

	async updateLink(id: LinkId, updates: Partial<Link>): Promise<Result<void, ApiError>> {
		return this.request<void>(`${API_ENDPOINTS.LINKS}/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(updates)
		});
	}

	async deleteLink(id: LinkId): Promise<Result<void, ApiError>> {
		return this.request<void>(`${API_ENDPOINTS.LINKS}/${id}`, { method: 'DELETE' });
	}

	async createWorkspace(name: string): Promise<Result<Workspace, ApiError>> {
		return this.request<Workspace>(API_ENDPOINTS.WORKSPACES, {
			method: 'POST',
			body: JSON.stringify({ name })
		});
	}

	async deleteWorkspace(id: WorkspaceId): Promise<Result<void, ApiError>> {
		return this.request<void>(`${API_ENDPOINTS.WORKSPACES}/${id}`, { method: 'DELETE' });
	}

	async migrate(data: { links: Link[], workspaces: Workspace[] }): Promise<Result<void, ApiError>> {
		return this.request<void>(API_ENDPOINTS.MIGRATE, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}
}

/**
 * Main application store using Svelte 5 runes.
 * Orchestrates domain state (links, workspaces) and UI state (filters, search).
 */
export class LinkStore {
	// --- Domain State ---
	links = $state<Link[]>([]);
	workspaces = $state<Workspace[]>([]);
	activeWorkspaceId = $state<WorkspaceId>(APP_CONFIG.DEFAULT_WORKSPACE_ID as WorkspaceId);

	// --- UI State ---
	activeCategory = $state<Category>(CATEGORIES.INBOX);
	searchQuery = $state('');
	selectedTags = $state<string[]>([]);

	private repository: Repository;
	private logger: Logger;

	constructor(
		data?: { workspaces: Workspace[], links: Link[], activeWorkspaceId: WorkspaceId },
		options: { repository?: Repository, logger?: Logger } = {}
	) {
		this.logger = options.logger || defaultLogger;
		this.repository = options.repository || new Repository(this.logger);

		if (data) {
			this.hydrate(data);
		}
	}

	/**
	 * Synchronously hydrates the store with initial data.
	 */
	hydrate(data: { workspaces: Workspace[], links: Link[], activeWorkspaceId: WorkspaceId }) {
		this.workspaces = data.workspaces;
		this.links = data.links;
		this.activeWorkspaceId = data.activeWorkspaceId;
	}

	/**
	 * Migrates data from localStorage to SQLite if needed.
	 * Only runs in the browser.
	 */
	async migrateFromLocalStorageIfNeeded(): Promise<void> {
		if (!browser || localStorage.getItem(STORAGE_KEYS.MIGRATED_SQLITE)) return;

		const localLinks = localStorage.getItem(STORAGE_KEYS.LEGACY_LINKS);
		const localWorkspaces = localStorage.getItem(STORAGE_KEYS.LEGACY_WORKSPACES);

		if (localLinks || localWorkspaces) {
			const data = {
				links: localLinks ? JSON.parse(localLinks) : [],
				workspaces: localWorkspaces ? JSON.parse(localWorkspaces) : []
			};

			const result = await this.repository.migrate(data);
			if (result.ok) {
				localStorage.setItem(STORAGE_KEYS.MIGRATED_SQLITE, 'true');
				window.location.reload();
			} else {
				this.logger.error('Migration failed', result.error);
			}
		} else {
			localStorage.setItem(STORAGE_KEYS.MIGRATED_SQLITE, 'true');
		}
	}

	/**
	 * Fetches all links for the currently active workspace.
	 */
	async fetchLinksForActiveWorkspaceAsync(): Promise<void> {
		const result = await this.repository.fetchLinks(this.activeWorkspaceId);
		if (result.ok) {
			this.links = result.value;
		} else {
			this.logger.error('Failed to load links', result.error);
		}
	}

	/**
	 * Derived state: The currently active workspace object.
	 */
	activeWorkspace = $derived.by(() => {
		const found = this.workspaces.find((w) => w.id === this.activeWorkspaceId);
		if (found) return found;

		if (this.workspaces.length > 0) return this.workspaces[0];

		return {
			id: APP_CONFIG.DEFAULT_WORKSPACE_ID as WorkspaceId,
			name: 'My Workspace',
			slug: 'my-workspace',
			createdAt: Date.now()
		} as Workspace;
	});

	/**
	 * Derived state: Links filtered by current UI state.
	 */
	filteredLinks = $derived.by(() => {
		return FilterService.filter(
			this.links,
			this.activeCategory,
			this.searchQuery,
			this.selectedTags
		);
	});

	/**
	 * Derived state: Unique tags extracted from all links in the current workspace.
	 */
	allTags = $derived.by(() => {
		return FilterService.extractUniqueTags(this.links);
	});

	/**
	 * Adds a new link with optimistic update and rollback on failure.
	 * @param linkData - The link properties to create
	 */
	async addLinkAsync(linkData: Omit<Link, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>): Promise<Result<Link, ApiError>> {
		const tempId = crypto.randomUUID() as LinkId;
		const now = Date.now();

		const newLink: Link = {
			...linkData,
			id: tempId,
			workspaceId: this.activeWorkspaceId,
			createdAt: now,
			updatedAt: now,
			isFavorite: false,
			isArchived: false,
			isDeleted: false,
			tags: linkData.tags || []
		};

		// Optimistic update
		const previousLinks = [...this.links];
		this.links = [newLink, ...this.links];

		const result = await this.repository.createLink({
			...linkData,
			workspaceId: this.activeWorkspaceId
		});

		if (result.ok) {
			const idx = this.links.findIndex(l => l.id === tempId);
			if (idx !== -1) this.links[idx] = result.value;
			return result;
		} else {
			// Rollback
			this.links = previousLinks;
			this.logger.error('Add link failed', result.error);
			return result;
		}
	}

	/**
	 * Updates an existing link with optimistic update.
	 */
	async updateLinkAsync(id: LinkId, updates: Partial<Link>): Promise<void> {
		const index = this.links.findIndex((l) => l.id === id);
		if (index === -1) return;

		const originalLink = { ...this.links[index] };

		// Optimistic update
		this.links[index] = {
			...this.links[index],
			...updates,
			updatedAt: Date.now()
		};

		const result = await this.repository.updateLink(id, updates);
		if (!result.ok) {
			// Rollback
			this.links[index] = originalLink;
			this.logger.error(`Update failed for link ${id}`, result.error);
		}
	}

	/**
	 * Toggles the favorite status of a link.
	 */
	async toggleFavoriteAsync(id: LinkId): Promise<void> {
		const link = this.links.find(l => l.id === id);
		if (link) {
			await this.updateLinkAsync(id, { isFavorite: !link.isFavorite });
		}
	}

	/**
	 * Toggles the archived status of a link.
	 */
	async toggleArchivedAsync(id: LinkId): Promise<void> {
		const link = this.links.find(l => l.id === id);
		if (link) {
			await this.updateLinkAsync(id, { isArchived: !link.isArchived });
		}
	}

	/**
	 * Toggles the deleted (trash) status of a link.
	 */
	async toggleDeletedAsync(id: LinkId): Promise<void> {
		const link = this.links.find(l => l.id === id);
		if (link) {
			await this.updateLinkAsync(id, { isDeleted: !link.isDeleted });
		}
	}

	/**
	 * Permanently removes a link with optimistic update.
	 */
	async removeLinkPermanentlyAsync(id: LinkId): Promise<void> {
		const previousLinks = [...this.links];
		this.links = this.links.filter((l) => l.id !== id);

		const result = await this.repository.deleteLink(id);
		if (!result.ok) {
			this.links = previousLinks;
			this.logger.error(`Permanent removal failed for link ${id}`, result.error);
		}
	}

	/**
	 * Switches the active workspace, updates cookies, and reloads links.
	 */
	async setActiveWorkspaceAsync(id: WorkspaceId): Promise<void> {
		this.activeWorkspaceId = id;
		this.selectedTags = [];
		this.activeCategory = CATEGORIES.INBOX;

		if (browser) {
			document.cookie = `${STORAGE_KEYS.ACTIVE_WORKSPACE}=${id}; path=/; max-age=31536000; SameSite=Lax`;
		}

		await this.fetchLinksForActiveWorkspaceAsync();
	}

	/**
	 * Updates the current active category.
	 */
	setCategory(category: Category): void {
		this.activeCategory = category;
	}

	/**
	 * Adds a new workspace.
	 */
	async addWorkspaceAsync(name: string): Promise<Result<Workspace, ApiError>> {
		const result = await this.repository.createWorkspace(name);

		if (result.ok) {
			this.workspaces = [...this.workspaces, result.value];
			return result;
		} else {
			this.logger.error('Failed to create workspace', result.error);
			return result;
		}
	}

	/**
	 * Removes a workspace if it's not the last one.
	 */
	async removeWorkspaceAsync(id: WorkspaceId): Promise<void> {
		if (this.workspaces.length <= 1) {
			this.logger.warn('Cannot remove the last workspace');
			return;
		}

		const previousWorkspaces = [...this.workspaces];
		this.workspaces = this.workspaces.filter((w) => w.id !== id);

		const result = await this.repository.deleteWorkspace(id);
		if (!result.ok) {
			this.workspaces = previousWorkspaces;
			this.logger.error(`Failed to delete workspace ${id}`, result.error);
		} else if (this.activeWorkspaceId === id) {
			// If we deleted the active workspace, switch to another one
			await this.setActiveWorkspaceAsync(this.workspaces[0].id);
		}
	}

	/**
	 * Toggles a tag in the selected filters.
	 */
	toggleTag(tag: string): void {
		const index = this.selectedTags.indexOf(tag);
		if (index !== -1) {
			this.selectedTags = this.selectedTags.filter((t) => t !== tag);
		} else {
			this.selectedTags = [...this.selectedTags, tag];
		}
	}
}
