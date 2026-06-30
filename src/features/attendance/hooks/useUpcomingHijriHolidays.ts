import { useQuery } from '@tanstack/react-query';
import type { UpcomingHijriHoliday } from '@/data/attendance-hijri-holidays';

function formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
}

async function fetchUpcomingHijriHolidaysFromApi(
    from: Date,
    year: number,
): Promise<UpcomingHijriHoliday[]> {
    const params = new URLSearchParams({
        from: from.toISOString(),
        year: String(year),
    });

    const response = await fetch(`/api/attendance/hijri-holidays?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to load Hijri holidays');
    }

    return response.json() as Promise<UpcomingHijriHoliday[]>;
}

export function useUpcomingHijriHolidays(enabled: boolean, from = new Date(), year = from.getFullYear()) {
    const fromKey = formatDateKey(from);

    return useQuery({
        queryKey: ['attendance', 'hijri-holidays', year, fromKey],
        queryFn: () => fetchUpcomingHijriHolidaysFromApi(from, year),
        enabled,
        staleTime: 86_400_000,
        gcTime: 86_400_000,
    });
}
