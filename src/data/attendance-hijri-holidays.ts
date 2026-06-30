export type HijriHolidayCatalogItem = {
    id: string;
    nameKey: string;
    defaultName: string;
    isReligious: boolean;
};

export type HijriHolidayRule = HijriHolidayCatalogItem & {
    hijriMonth: number;
    hijriDay: number;
};

export type UpcomingHijriHoliday = HijriHolidayCatalogItem & {
    date: string;
};

export const HIJRI_HOLIDAY_RULES: HijriHolidayRule[] = [
    {
        id: 'eidAlFitr1',
        nameKey: 'attendance.hijriHolidays.eidAlFitr1',
        defaultName: 'Eid Al-Fitr (Day 1)',
        isReligious: true,
        hijriMonth: 10,
        hijriDay: 1,
    },
    {
        id: 'eidAlFitr2',
        nameKey: 'attendance.hijriHolidays.eidAlFitr2',
        defaultName: 'Eid Al-Fitr (Day 2)',
        isReligious: true,
        hijriMonth: 10,
        hijriDay: 2,
    },
    {
        id: 'eidAlFitr3',
        nameKey: 'attendance.hijriHolidays.eidAlFitr3',
        defaultName: 'Eid Al-Fitr (Day 3)',
        isReligious: true,
        hijriMonth: 10,
        hijriDay: 3,
    },
    {
        id: 'arafatDay',
        nameKey: 'attendance.hijriHolidays.arafatDay',
        defaultName: 'Arafat Day',
        isReligious: true,
        hijriMonth: 12,
        hijriDay: 9,
    },
    {
        id: 'eidAlAdha1',
        nameKey: 'attendance.hijriHolidays.eidAlAdha1',
        defaultName: 'Eid Al-Adha (Day 1)',
        isReligious: true,
        hijriMonth: 12,
        hijriDay: 10,
    },
    {
        id: 'eidAlAdha2',
        nameKey: 'attendance.hijriHolidays.eidAlAdha2',
        defaultName: 'Eid Al-Adha (Day 2)',
        isReligious: true,
        hijriMonth: 12,
        hijriDay: 11,
    },
    {
        id: 'eidAlAdha3',
        nameKey: 'attendance.hijriHolidays.eidAlAdha3',
        defaultName: 'Eid Al-Adha (Day 3)',
        isReligious: true,
        hijriMonth: 12,
        hijriDay: 12,
    },
    {
        id: 'eidAlAdha4',
        nameKey: 'attendance.hijriHolidays.eidAlAdha4',
        defaultName: 'Eid Al-Adha (Day 4)',
        isReligious: true,
        hijriMonth: 12,
        hijriDay: 13,
    },
    {
        id: 'islamicNewYear',
        nameKey: 'attendance.hijriHolidays.islamicNewYear',
        defaultName: 'Islamic New Year',
        isReligious: true,
        hijriMonth: 1,
        hijriDay: 1,
    },
    {
        id: 'prophetBirthday',
        nameKey: 'attendance.hijriHolidays.prophetBirthday',
        defaultName: "Prophet Muhammad's Birthday",
        isReligious: true,
        hijriMonth: 3,
        hijriDay: 12,
    },
];

export function normalizeHolidayDate(value: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value.split('T')[0];
    }

    const year = parsed.getUTCFullYear();
    const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    const day = String(parsed.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function toUtcHolidayIsoDate(dateKey: string): string {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toISOString();
}

export function isHolidayDateAlreadySaved(
    existingHolidays: Array<{ date: string }>,
    date: string,
): boolean {
    const normalizedDate = normalizeHolidayDate(date);

    return existingHolidays.some(
        (holiday) => normalizeHolidayDate(holiday.date) === normalizedDate,
    );
}

export function isHolidayAlreadySaved(
    existingHolidays: Array<{ name: string; date: string }>,
    name: string,
    date: string,
): boolean {
    const normalizedDate = normalizeHolidayDate(date);
    const normalizedName = name.trim().toLowerCase();

    return existingHolidays.some(
        (holiday) =>
            normalizeHolidayDate(holiday.date) === normalizedDate &&
            holiday.name.trim().toLowerCase() === normalizedName,
    );
}
