import metascraper from 'metascraper';
import mTitle from 'metascraper-title';
import mDescription from 'metascraper-description';
import mImage from 'metascraper-image';
import mLogo from 'metascraper-logo';
import mClearbit from 'metascraper-clearbit';
import mPublisher from 'metascraper-publisher';
import mAuthor from 'metascraper-author';
import mUrl from 'metascraper-url';

const scraper = metascraper([
	mTitle(),
	mDescription(),
	mImage(),
	mLogo(),
	mClearbit(),
	mPublisher(),
	mAuthor(),
	mUrl()
]);

export interface OpenGraphData {
	title: string | null;
	description: string | null;
	image: string | null;
	author?: string | null;
	publisher?: string | null;
	logo?: string | null;
	url?: string | null;
}

export async function fetchOpenGraph(url: string): Promise<OpenGraphData> {
	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
				'Accept-Language': 'en-US,en;q=0.9',
				'Cache-Control': 'no-cache',
				Pragma: 'no-cache'
			}
		});

		if (!response.ok) {
			return { title: null, description: null, image: null, url };
		}

		const html = await response.text();
		const metadata = await scraper({ html, url });

		let logo = metadata.logo || null;

		// Fallback: Manual favicon extraction from HTML
		if (!logo) {
			const iconRegex = /<link[^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon)["'][^>]+href=["']([^"']+)["']/gi;
			let match;
			const icons: string[] = [];
			while ((match = iconRegex.exec(html)) !== null) {
				icons.push(match[1]);
			}

			if (icons.length > 0) {
				// Prefer apple-touch-icon or larger icons if possible (heuristic)
				const bestIcon = icons.find(i => i.includes('apple-touch-icon') || i.includes('180') || i.includes('192')) || icons[0];
				try {
					logo = new URL(bestIcon, url).toString();
				} catch {
					logo = bestIcon;
				}
			}
		}

		// Second Fallback: Google Favicon Service
		if (!logo) {
			try {
				const domain = new URL(url).hostname;
				logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
			} catch {
				// Ignore
			}
		}

		return {
			title: metadata.title || null,
			description: metadata.description || null,
			image: metadata.image || null,
			author: metadata.author || null,
			publisher: metadata.publisher || null,
			logo: logo,
			url: metadata.url || url
		};
	} catch (error) {
		console.error('Error fetching metadata:', error);
		return { title: null, description: null, image: null, url };
	}
}