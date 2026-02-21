import type { Link } from '$lib/types';
import { subDays, startOfDay, isSameDay, format } from 'date-fns';

export interface ActivityData {
	date: string;
	fullDate: string;
	count: number;
}

export interface AppStats {
	total: number;
	favorites: number;
	activity: ActivityData[];
}

export const StatsService = {
	getTrendingTags(links: Link[], limit = 8): [string, number][] {
		const tagCounts: Record<string, number> = {};
		links.forEach((link) => {
			if (link.isDeleted) return;
			link.tags.forEach((tag) => {
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			});
		});
		return Object.entries(tagCounts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, limit);
	},

	getStats(links: Link[]): AppStats {
		const activeLinks = links.filter((l) => !l.isDeleted);
		const total = activeLinks.length;
		const favorites = activeLinks.filter((l) => l.isFavorite).length;

		// Activity data for chart (last 7 days)
		const last7Days = Array.from({ length: 7 }, (_, i) => {
			const date = subDays(startOfDay(new Date()), 6 - i);
			const count = activeLinks.filter((l) => isSameDay(new Date(l.createdAt), date)).length;
			return {
				date: format(date, 'EEE'),
				fullDate: format(date, 'MMM d'),
				count
			};
		});

		return { total, favorites, activity: last7Days };
	}
};
