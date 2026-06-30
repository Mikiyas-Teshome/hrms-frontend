'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
    value?: string | Date;
    onChange?: (date: Date | undefined) => void;
    className?: string;
    placeholder?: string;
}

export function DatePicker({ value, onChange, className, placeholder = 'Pick a date' }: DatePickerProps) {
    const [uncontrolledDate, setUncontrolledDate] = React.useState<Date | undefined>(
        value ? new Date(value) : undefined
    );

    const date = value ? new Date(value) : uncontrolledDate;

    const handleSelect = (selectedDate: Date | undefined) => {
        if (!value) {
            setUncontrolledDate(selectedDate);
        }
        onChange?.(selectedDate);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-full justify-start text-left font-normal border-border bg-background h-9 px-3',
                        !date && 'text-muted-foreground',
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">
                        {date ? format(date, 'PPP') : placeholder}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[60]" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    initialFocus
                    className="rounded-xl border-border"
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear() + 10}
                />
            </PopoverContent>
        </Popover>
    );
}
