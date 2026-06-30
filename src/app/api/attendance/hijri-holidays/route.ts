import { NextRequest, NextResponse } from 'next/server';
import { fetchUpcomingHijriHolidays } from '@/features/attendance/hijri-holidays.service';

export const revalidate = 86_400;

export async function GET(request: NextRequest) {
    try {
        const fromParam = request.nextUrl.searchParams.get('from');
        const yearParam = request.nextUrl.searchParams.get('year');

        const from = fromParam ? new Date(fromParam) : new Date();
        const year = yearParam ? Number(yearParam) : from.getFullYear();

        if (!Number.isFinite(from.getTime()) || !Number.isFinite(year)) {
            return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
        }

        const holidays = await fetchUpcomingHijriHolidays(from, year);
        return NextResponse.json(holidays);
    } catch {
        return NextResponse.json({ error: 'Failed to load Hijri holidays' }, { status: 502 });
    }
}
