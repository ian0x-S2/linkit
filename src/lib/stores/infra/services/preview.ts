import { defaultLogger } from '$lib/stores/infra/logger';

export interface LinkPreview {
	url: string;
	title: string | null;
	description: string | null;
	image: string | null;
	logo: string | null;
}

export const PreviewService = {
	async fetch(url: string): Promise<LinkPreview> {
		try {
			const response = await fetch('/api/opengraph', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});
			if (!response.ok) throw new Error('Failed to fetch preview');
			const data = await response.json();
			return {
				url,
				title: data.title || null,
				description: data.description || null,
				image: data.image || null,
				logo: data.logo || null
			};
		} catch (err) {
			defaultLogger.error('Failed to fetch link preview', { error: err, url });
			return { url, title: null, description: null, image: null, logo: null };
		}
	}
};
