import {
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from 'date-fns';

export interface CalendarMonthBounds {
  year: number;
  month: number;
  start: Date;
  end: Date;
  key: string;
}

export function getCalendarMonthBounds(reference: Date = new Date()): CalendarMonthBounds {
  const start = startOfMonth(reference);
  const end = endOfMonth(reference);
  return {
    year: start.getFullYear(),
    month: start.getMonth(),
    start,
    end,
    key: format(start, 'yyyy-MM'),
  };
}

export function getPreviousCalendarMonthBounds(reference: Date = new Date()): CalendarMonthBounds {
  return getCalendarMonthBounds(subMonths(reference, 1));
}

export function isRunInCalendarMonth(
  runStartIso: string,
  bounds: CalendarMonthBounds,
): boolean {
  const start = new Date(runStartIso);
  return start.getFullYear() === bounds.year && start.getMonth() === bounds.month;
}

export function formatMonthChartLabel(date: Date): string {
  return format(date, 'MMM yyyy');
}
