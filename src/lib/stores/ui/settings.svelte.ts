import { PersistedState } from 'runed';
import { browser } from '$app/environment';
import { STORAGE_KEYS } from '$lib/constants';

export interface SettingsStore {
	viewMode: 'list' | 'grid';
	setViewMode(mode: 'list' | 'grid'): void;
}

export function createSettingsStore(initialValue: 'list' | 'grid' = 'list'): SettingsStore {
	const _viewMode = new PersistedState<'list' | 'grid'>('view-mode', initialValue);

	// Sync to cookie for SSR consistency (avoid flicker)
	$effect(() => {
		const value = _viewMode.current;
		if (browser) {
			document.cookie = `${STORAGE_KEYS.VIEW_MODE}=${value}; path=/; max-age=31536000; SameSite=Lax`;
		}
	});

	return {
		get viewMode() {
			return _viewMode.current;
		},
		set viewMode(value: 'list' | 'grid') {
			_viewMode.current = value;
		},
		setViewMode(mode: 'list' | 'grid') {
			_viewMode.current = mode;
		}
	};
}
