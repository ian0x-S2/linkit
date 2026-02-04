import { PersistedState } from 'runed';
import { browser } from '$app/environment';
import { STORAGE_KEYS } from '$lib/constants';

export interface SettingsStore {
	viewMode: 'list' | 'grid';
	setViewMode(mode: 'list' | 'grid'): void;
}

export function createSettingsStore(initialValue: 'list' | 'grid' = 'list'): SettingsStore {
	// Use a regular $state for initial hydration to match server
	let _currentMode = $state<'list' | 'grid'>(initialValue);

	// Sync with localStorage only after mount/on client
	$effect(() => {
		if (browser) {
			const saved = localStorage.getItem('view-mode');
			if (saved === 'list' || saved === 'grid') {
				_currentMode = saved;
			}
		}
	});

	// Sync to cookie for SSR consistency
	$effect(() => {
		if (browser) {
			localStorage.setItem('view-mode', _currentMode);
			document.cookie = `${STORAGE_KEYS.VIEW_MODE}=${_currentMode}; path=/; max-age=31536000; SameSite=Lax`;
		}
	});

	return {
		get viewMode() {
			return _currentMode;
		},
		set viewMode(value: 'list' | 'grid') {
			_currentMode = value;
		},
		setViewMode(mode: 'list' | 'grid') {
			_currentMode = mode;
		}
	};
}
