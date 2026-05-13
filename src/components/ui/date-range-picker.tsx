'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateRange {
    from: Date | null;
    to: Date | null;
}

interface DateRangePickerProps {
    value?: DateRange;
    onChange?: (range: DateRange) => void;
    className?: string;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

function isInRange(date: Date, from: Date | null, to: Date | null): boolean {
    if (!from || !to) return false;
    const t = date.getTime();
    return t > from.getTime() && t < to.getTime();
}

interface MonthCalendarProps {
    year: number;
    month: number;
    range: DateRange;
    hovered: Date | null;
    onDayClick: (date: Date) => void;
    onDayHover: (date: Date) => void;
}

function MonthCalendar({ year, month, range, hovered, onDayClick, onDayHover }: MonthCalendarProps) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells: (Date | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(new Date(year, month, d));
    }
    const rangeEnd = range.to || hovered;

    return (
        <div className="select-none w-[252px] shrink-0">
            <div className="text-center text-sm font-semibold mb-4 text-foreground">
                {MONTHS[month]} {year}
            </div>
            <div className="grid grid-cols-7 gap-0 mb-1">
                {DAYS.map((d) => (
                    <div key={d} className="text-center text-[12px] text-muted-foreground font-medium w-9 h-9 flex items-center justify-center">
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-0">
                {cells.map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} className="w-9 h-9" />;

                    const isStart = range.from && isSameDay(date, range.from);
                    const isEnd = range.to && isSameDay(date, range.to);
                    const isHovered = !range.to && hovered && isSameDay(date, hovered);
                    const inRange = isInRange(date, range.from, rangeEnd);

                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => onDayClick(date)}
                            onMouseEnter={() => onDayHover(date)}
                            type="button"
                            className={cn(
                                'w-9 h-9 text-sm flex items-center justify-center transition-colors relative z-0',
                                !isStart && !isEnd && !inRange && 'hover:bg-muted rounded-full',
                                inRange && 'bg-[#2865E3]/10 text-foreground',
                                (isStart || isEnd) && 'bg-[#2865E3] text-white rounded-full z-10',
                                isHovered && !range.from && 'bg-muted rounded-full',
                                // Correcting the rounded corners for the range highlight
                                isStart && range.to && 'rounded-l-full',
                                isEnd && 'rounded-r-full',
                                inRange && !isStart && !isEnd && 'rounded-none'
                            )}
                        >
                            <span className="relative z-10">{date.getDate()}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const [range, setRange] = useState<DateRange>(value || { from: null, to: null });
    const [hovered, setHovered] = useState<Date | null>(null);
    
    const now = new Date();
    const [leftYear, setLeftYear] = useState(now.getFullYear());
    const [leftMonth, setLeftMonth] = useState(now.getMonth());
    
    const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;
    const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) setRange(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDayClick = (date: Date) => {
        if (!range.from || (range.from && range.to)) {
            const newRange = { from: date, to: null };
            setRange(newRange);
            setHovered(null);
        } else {
            const newRange = date < range.from
                ? { from: date, to: range.from }
                : { from: range.from, to: date };
            setRange(newRange);
            onChange?.(newRange);
            setOpen(false);
        }
    };

    const prevMonth = () => {
        if (leftMonth === 0) { setLeftMonth(11); setLeftYear((y) => y - 1); }
        else setLeftMonth((m) => m - 1);
    };

    const nextMonth = () => {
        if (leftMonth === 11) { setLeftMonth(0); setLeftYear((y) => y + 1); }
        else setLeftMonth((m) => m + 1);
    };

    const label = range.from && range.to
        ? `${formatDate(range.from)} – ${formatDate(range.to)}`
        : range.from
        ? `${formatDate(range.from)} – ...`
        : 'Select date range';

    return (
        <div ref={ref} className={cn('relative', className)}>
            <Button
                variant="outline"
                className="h-9 w-[240px] gap-2 border-border shadow-xs rounded-lg px-3 py-2 justify-start font-medium text-sm leading-5 text-foreground bg-background hover:bg-muted/50 transition-all"
                onClick={() => setOpen((o) => !o)}
            >
                <CalendarIcon className="size-4 text-foreground shrink-0" strokeWidth={1.33} />
                <span className="truncate flex-1 text-left">{label}</span>
            </Button>

            {open && (
                <div className="absolute right-0 top-[44px] z-50 bg-background text-foreground border border-border rounded-[16px] shadow-2xl p-6 flex flex-col sm:flex-row gap-8 animate-in fade-in zoom-in-95 duration-200">
                    {/* Navigation Buttons Container */}
                    <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none">
                        <button 
                            onClick={prevMonth} 
                            className="p-2 hover:bg-muted rounded-lg transition-colors pointer-events-auto"
                            type="button"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <button 
                            onClick={nextMonth} 
                            className="p-2 hover:bg-muted rounded-lg transition-colors pointer-events-auto"
                            type="button"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>

                    {/* Left month */}
                    <MonthCalendar
                        year={leftYear}
                        month={leftMonth}
                        range={range}
                        hovered={hovered}
                        onDayClick={handleDayClick}
                        onDayHover={setHovered}
                    />

                    {/* Right month */}
                    <MonthCalendar
                        year={rightYear}
                        month={rightMonth}
                        range={range}
                        hovered={hovered}
                        onDayClick={handleDayClick}
                        onDayHover={setHovered}
                    />
                </div>
            )}
        </div>
    );
}
