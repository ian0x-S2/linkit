/**
 * Checks if a string is a valid URL.
 */
export function isValidUrl(string: string): boolean {
	try {
		new URL(string);
		return true;
	} catch {
		return false;
	}
}

/**
 * Extracts a URL from a string. If it's a domain-like string, prepends 'https://'.
 */
export function extractUrl(text: string): string | null {
	const urlRegex = /(https?:\/\/[^\s]+)/;
	const match = text.match(urlRegex);
	if (match) return match[0];
	if (text.includes('.') && !text.includes(' ')) {
		return `https://${text}`;
	}
	return null;
}

/**
 * Gets the base domain of a URL (e.g., google.com).
 */
export function getDomain(url: string): string {
	try {
		return new URL(url).hostname.replace('www.', '');
	} catch {
		return url;
	}
}
