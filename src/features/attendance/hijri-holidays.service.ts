import {
    HIJRI_HOLIDAY_RULES,
    type UpcomingHijriHoliday,
} from '@/data/attendance-hijri-holidays';

const ALADHAN_BASE_URL = 'https://api.aladhan.com/v1';

type AladhanDatePayload = {
    hijri?: {
        year?: string;
    };
    gregorian?: {
        date?: string;
    };
};

type AladhanSingleDateResponse = {
    code?: number;
    data?: AladhanDatePayload;
};

const conversionCache = new Map<string, string | null>();

function formatGregorianParam(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

function formatHijriParam(day: number, month: number, year: number): string {
    return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
}

function parseAladhanGregorianDate(value: string): string {
    const [day, month, year] = value.split('-');
    return `${year}-${month}-${day}`;
}

function toUtcDateOnly(value: Date): Date {
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
}

async function fetchAladhanJson<T>(path: string): Promise<T> {
    const response = await fetch(`${ALADHAN_BASE_URL}${path}`, {
        next: { revalidate: 86_400 },
    });

    if (!response.ok) {
        throw new Error(`Aladhan request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

async function fetchHijriYearForGregorianDate(date: Date): Promise<number> {
    const payload = await fetchAladhanJson<AladhanSingleDateResponse>(`/gToH/${formatGregorianParam(date)}`);
    const hijriYear = Number(payload.data?.hijri?.year);

    if (!Number.isFinite(hijriYear)) {
        throw new Error('Unable to resolve Hijri year from Aladhan');
    }

    return hijriYear;
}

async function fetchGregorianDateForHijriDate(
    day: number,
    month: number,
    year: number,
): Promise<string | null> {
    const cacheKey = `${day}-${month}-${year}`;
    if (conversionCache.has(cacheKey)) {
        return conversionCache.get(cacheKey) ?? null;
    }

    try {
        const payload = await fetchAladhanJson<AladhanSingleDateResponse>(
            `/hToG/${formatHijriParam(day, month, year)}`,
        );
        const gregorianDate = payload.data?.gregorian?.date;
        const normalized = gregorianDate ? parseAladhanGregorianDate(gregorianDate) : null;
        conversionCache.set(cacheKey, normalized);
        return normalized;
    } catch {
        conversionCache.set(cacheKey, null);
        return null;
    }
}

export async function fetchUpcomingHijriHolidays(
    from: Date,
    year = from.getFullYear(),
): Promise<UpcomingHijriHoliday[]> {
    const rangeStart = toUtcDateOnly(from);
    const rangeEnd = new Date(Date.UTC(year, 11, 31));

    const startHijriYear = await fetchHijriYearForGregorianDate(from);
    const endHijriYear = await fetchHijriYearForGregorianDate(rangeEnd);
    const hijriYears: number[] = [];

    for (let hijriYear = startHijriYear; hijriYear <= endHijriYear; hijriYear += 1) {
        hijriYears.push(hijriYear);
    }

    const resolved = await Promise.all(
        hijriYears.flatMap((hijriYear) =>
            HIJRI_HOLIDAY_RULES.map(async (rule) => {
                const date = await fetchGregorianDateForHijriDate(
                    rule.hijriDay,
                    rule.hijriMonth,
                    hijriYear,
                );

                if (!date) {
                    return null;
                }

                const holidayDate = toUtcDateOnly(new Date(`${date}T00:00:00`));
                if (holidayDate < rangeStart || holidayDate > rangeEnd) {
                    return null;
                }

                return {
                    id: `${rule.id}-${hijriYear}`,
                    nameKey: rule.nameKey,
                    defaultName: rule.defaultName,
                    isReligious: rule.isReligious,
                    date,
                } satisfies UpcomingHijriHoliday;
            }),
        ),
    );

    return resolved
        .filter((holiday): holiday is UpcomingHijriHoliday => holiday !== null)
        .sort((left, right) => left.date.localeCompare(right.date));
}
